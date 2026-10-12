"use client";

/* The Expo assets are intentionally shared; this browser demo simulates visits. */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { ExpoInteractiveMap } from "@/features/map";
import { CATEGORIES, STANDS, findStand, zoneName } from "./catalog";
import { EVENTS, eventStatus } from "./events";
import { ICON_GLYPHS, type IconName } from "./icon-glyphs";
import { MISSIONS } from "./missions";
import { mobileMapStands } from "./map-catalog";
import { REWARDS } from "./rewards";
import { missionProgress, pointsFor, useMobileDemo } from "./store";
import type { Screen, View, Stand } from "./types";
import { VenueOverview } from "./VenueOverview";
import s from "./mobile-demo.module.css";

const ART = "/assets/mobile/quick-actions/";
const EVENT_ART = "/assets/mobile/events/";
const CATEGORY_ICON: Record<string, IconName> = { technology: "memory", health: "health_and_safety", finance: "account_balance", gastronomy: "restaurant", education: "school", startups: "rocket_launch" };
const CATEGORY_COLOR: Record<string, string> = { technology: "#1677b8", health: "#e8684d", finance: "#7a4fa0", gastronomy: "#ffc21a", education: "#82b5e3", startups: "#62be5a" };
const TABS: { view: View; label: string; icon: IconName }[] = [
  { view: "home", label: "Inicio", icon: "home" }, { view: "map", label: "Mapa", icon: "map" },
  { view: "scan", label: "Check-in", icon: "crop_free" }, { view: "missions", label: "Misiones", icon: "flag" },
  { view: "profile", label: "Perfil", icon: "person" },
];
const TITLES: Record<View, string> = { home: "Fexpo", map: "Mapa", scan: "Check-in", missions: "Misiones", profile: "Perfil", stands: "Stands", qr: "Mi código QR", rewards: "Premios", event: "Feria", stand: "Stand", receipt: "Comprobante" };
const aliases: Record<string, View> = { home: "home", map: "map", scan: "scan", nfc: "scan", "check-in": "scan", missions: "missions", profile: "profile", explore: "stands", stands: "stands", "my-qr": "qr", rewards: "rewards" };
export function screenFromPath(path: string, tab?: string | null): Screen {
  const segments = path.split("/").filter(Boolean).slice(1);
  if (segments[0] === "events" && segments[1]) return { view: "event", id: segments[1] };
  if (segments[0] === "stands" && segments[1]) return { view: "stand", id: segments[1] };
  return { view: aliases[segments[0] ?? tab ?? "home"] ?? "home" };
}
function pathFor(screen: Screen) {
  if (screen.view === "home") return "/demo";
  if (screen.view === "event") return `/demo/events/${screen.id}`;
  if (screen.view === "stand") return `/demo/stands/${screen.id}`;
  return `/demo/${screen.view === "qr" ? "my-qr" : screen.view}`;
}
function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return <span className={s.icon} style={{ fontSize: size }} aria-hidden="true">{String.fromCodePoint(ICON_GLYPHS[name])}</span>;
}
function Badge({ name, color = "var(--m-primary)", children }: { name: IconName; color?: string; children?: ReactNode }) {
  return <span className={s.iconBadge} style={{ color, background: `color-mix(in srgb, ${color} 12%, var(--m-surface))` }}>{children ?? <Icon name={name} />}</span>;
}
function Progress({ value, total }: { value: number; total: number }) {
  return <span className={s.progress} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={total} aria-label="Progreso de la misión"><span style={{ width: `${Math.min(value / total, 1) * 100}%` }} /></span>;
}
function Modal({ children, label, onClose, receipt = false }: { children: ReactNode; label: string; onClose: () => void; receipt?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} aria-label={label} className={`${s.dialog} ${receipt ? s.receiptDialog : ""}`} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className={s.dialogBody}><button className={s.dialogClose} aria-label={`Cerrar ${label.toLowerCase()}`} onClick={() => dialog.current?.close()}><Icon name="close" /></button>{children}</div>
  </dialog>;
}
function subscribeScheme(callback: () => void) { const media = window.matchMedia("(prefers-color-scheme: dark)"); media.addEventListener("change", callback); return () => media.removeEventListener("change", callback); }
const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
const serverDark = () => false;

export function MobileDemo({ initialScreen = { view: "home" } }: { initialScreen?: Screen }) {
  const state = useMobileDemo();
  const darkSystem = useSyncExternalStore(subscribeScheme, systemDark, serverDark);
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const content = useRef<HTMLElement>(null);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState<"signin" | "logout" | "reset" | null>(null);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ id: string; duplicate: boolean } | null>(null);
  const [scanTarget, setScanTarget] = useState(STANDS[0].id);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanAwarded, setScanAwarded] = useState(0);
  const [mapSelected, setMapSelected] = useState<string | null>(null);
  const [mapZone, setMapZone] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [qrVersion, setQrVersion] = useState(1);
  const [qrTime, setQrTime] = useState(60);
  const carousel = useRef<HTMLDivElement>(null);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visited = state.visits.map((visit) => visit.standId);
  const points = pointsFor(state);
  const level = [0, 150, 300, 500].filter((threshold) => points >= threshold).length;
  const completed = MISSIONS.filter((mission) => missionProgress(mission, visited) >= mission.target).length;
  const dark = state.theme === "dark" || (state.theme === "system" && darkSystem);

  useEffect(() => {
    void useMobileDemo.persist.rehydrate();
    const initial = screenFromPath(window.location.pathname, new URLSearchParams(window.location.search).get("tab"));
    const timer = window.setTimeout(() => { setScreen(initial); setNow(Date.now()); }, 0);
    function pop() {
      if (scanTimer.current) clearTimeout(scanTimer.current);
      setScanning(false); setReceipt(null); setSelectedReward(null); setDialog(null);
      setScreen(screenFromPath(window.location.pathname, new URLSearchParams(window.location.search).get("tab")));
    }
    window.addEventListener("popstate", pop);
    return () => { clearTimeout(timer); window.removeEventListener("popstate", pop); };
  }, []);
  useEffect(() => { content.current?.scrollTo({ top: 0 }); if (scanTimer.current) clearTimeout(scanTimer.current); }, [screen]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { if (screen.view !== "qr") return; const timer = setInterval(() => setQrTime((time) => Math.max(time - 1, 0)), 1000); return () => clearInterval(timer); }, [screen.view, qrVersion]);
  useEffect(() => () => { if (scanTimer.current) clearTimeout(scanTimer.current); }, []);

  const navigate = useCallback((view: View, id?: string) => {
    setScanning(false); setNotice("");
    const next = { view, id };
    setScreen(next); window.history.pushState(null, "", pathFor(next));
  }, []);
  const needAuth = (action: () => void) => { if (state.signedIn) action(); else setDialog("signin"); };
  function openMap(id?: string) {
    const stand = id ? findStand(id) ?? mobileMapStands.find((item) => item.id === id) : undefined;
    setMapSelected(id && mobileMapStands.some((item) => item.id === id) ? id : null);
    setMapZone(stand?.planId ?? null); navigate("map");
  }
  function startScan() {
    needAuth(() => {
      setScanning(true); setScanSuccess(false);
      scanTimer.current = setTimeout(() => {
        scanTimer.current = null;
        const result = useMobileDemo.getState().visit(scanTarget);
        setScanning(false);
        if (result === "invalid") { setNotice("Inicia la sesión demo para registrar una visita."); return; }
        setScanSuccess(true); setScanAwarded(result === "duplicate" ? 0 : 50); setReceipt({ id: scanTarget, duplicate: result === "duplicate" });
      }, 1600);
    });
  }
  function cancelScan() { if (scanTimer.current) clearTimeout(scanTimer.current); scanTimer.current = null; setScanning(false); }
  const receiptStand = receipt ? findStand(receipt.id) : undefined;
  const receiptVisit = state.visits.find((visit) => visit.standId === receipt?.id);
  const reward = REWARDS.find((item) => item.id === selectedReward);
  const activeTab = screen.view === "stand" || screen.view === "stands" || screen.view === "event" ? "home" : screen.view === "rewards" ? "missions" : screen.view === "qr" ? "profile" : screen.view;
  const secondary = ["stand", "stands", "qr", "event", "rewards"].includes(screen.view);
  const heading = screen.view === "stand" ? findStand(screen.id ?? "")?.name ?? mobileMapStands.find((stand) => stand.id === screen.id)?.name ?? "Stand" : screen.view === "event" ? EVENTS.find((event) => event.id === screen.id)?.name ?? "Feria" : TITLES[screen.view];
  const browseStands = STANDS.filter((stand) => (!favoritesOnly || state.favorites.includes(stand.id)) && (filter === "all" || filter === stand.category) && `${stand.name} ${stand.description} ${stand.boothCode} ${stand.tags.join(" ")}`.toLocaleLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(query.toLocaleLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")));

  function rewardCards() {
    return REWARDS.map((item) => <button className={s.rewardCard} key={item.id} onClick={() => setSelectedReward(item.id)}>
      <img src={`${ART}rewards.jpg`} alt="" /><strong>{item.title}</strong><span>{item.stockLabel}</span><b><Icon name="stars" size={16} />{state.redeemed.includes(item.id) ? "Canjeado" : `${item.cost} pts`}</b>
    </button>);
  }
  function standCards() {
    return browseStands.map((stand) => <button className={s.standCard} key={stand.id} onClick={() => navigate("stand", stand.id)}>
      <span className={s.standArt} style={{ background: CATEGORY_COLOR[stand.category] }}><Icon name={CATEGORY_ICON[stand.category]} size={30} /></span>
      <span className={s.standInfo}><strong>{stand.name}</strong><span>{CATEGORIES.find((category) => category.id === stand.category)?.label} · {stand.boothCode}</span><small>{stand.description}</small><span className={s.standTags}>{visited.includes(stand.id) ? <em>✓ Visitado</em> : <em>+50 pts</em>}{state.favorites.includes(stand.id) && <Icon name="favorite" size={16} />}</span></span><Icon name="chevron_right" size={18} />
    </button>);
  }
  function home() {
    const route = MISSIONS[0]; const progress = missionProgress(route, visited);
    return <div className={s.home}>
      <button className={s.search} onClick={() => navigate("stands")}><Icon name="search" /><span>Buscar stands y empresas</span></button>
      <h2>Ferias</h2>
      <div className={s.eventCarousel} ref={carousel} onScroll={(event) => { const first = event.currentTarget.firstElementChild as HTMLElement | null; if (first) setCarouselIndex(Math.round(event.currentTarget.scrollLeft / (first.offsetWidth + 12))); }}>
        {EVENTS.map((event) => <button className={s.eventCard} key={event.id} onClick={() => navigate("event", event.id)}>
          <span className={s.eventBanner}><img src={`${EVENT_ART}${event.banner}`} alt={`Banner ${event.name}`} fetchPriority="high" /><span className={s.eventStatus}>{now ? eventStatus(event, now) : "Próximamente"}</span>{!event.hasText && <strong>{event.name} <em>{event.edition}</em></strong>}</span>
          <span className={s.eventCaption}><b>{event.name}</b><span>{event.date} · {event.location}</span></span>
        </button>)}
      </div>
      <div className={s.carouselDots} aria-label="Ferias">{EVENTS.map((event, index) => <button key={event.id} aria-label={`Ver ${event.name}`} aria-pressed={carouselIndex === index} onClick={() => { const card = carousel.current?.firstElementChild as HTMLElement | null; if (card) carousel.current?.scrollTo({ left: index * (card.offsetWidth + 12), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }}><span /></button>)}</div>
      <div className={s.quickGrid}>{[
        ["map", "Mapa", "map.jpg", "#1677b8"], ["stands", "Stands", "stands.jpg", "#e8684d"], ["scan", "Check-in", "checkin.jpg", "#2e9e5b"],
        ["missions", "Misiones", "missions.jpg", "#7a4fa0"], ["rewards", "Premios", "rewards.jpg", "#ffc21a"], ["qr", "Mi QR", "my-qr.jpg", "#1677b8"],
      ].map(([view, label, image, accent]) => <button key={view} className={s.quickAction} onClick={() => navigate(view as View)}><img src={`${ART}${image}`} alt="" /><span style={{ borderTopColor: accent }}>{label}</span></button>)}</div>
      <button className={s.card} onClick={() => navigate("missions")}><span className={s.progressSummary}><Badge name="military_tech" color="var(--m-purple)" /><span className={s.grow}><strong>Nivel {level}</strong><small>{visited.length} de {STANDS.length} stands</small></span><b className={s.pointsNumber}>{points}</b><small>pts</small></span><span className={s.segments}>{STANDS.map((stand) => <i key={stand.id} className={visited.includes(stand.id) ? s.segmentDone : undefined} />)}</span></button>
      <button className={s.routeCard} onClick={() => navigate("missions")}><Badge name="flag" color="var(--m-purple)" /><span className={s.grow}><strong>Ruta FIPAZ</strong><Progress value={progress} total={3} /></span><b>{progress}/3</b></button>
      <div className={s.sectionHeading}><h2>Stands destacados</h2><button onClick={() => navigate("stands")}>Ver todos</button></div>
      <div className={s.featured}>{STANDS.filter((stand) => stand.featured).map((stand) => <button key={stand.id} onClick={() => navigate("stand", stand.id)}><span style={{ background: CATEGORY_COLOR[stand.category] }}><Icon name={CATEGORY_ICON[stand.category]} size={32} /></span><strong>{stand.name}</strong><small>Stand {stand.boothCode}</small></button>)}</div>
    </div>;
  }
  function missions() {
    return <div className={s.stack}>
      <div className={s.missionHero}><span><b>{completed}<small>/5</small></b><p>misiones completadas</p></span><img src={`${ART}missions.jpg`} alt="" /></div>
      <div className={`${s.card} ${s.missionList}`}>{MISSIONS.map((mission, index) => {
        const value = missionProgress(mission, visited); const done = value >= mission.target;
        return <button key={mission.id} className={s.missionRow} onClick={() => { setQuery(""); setFilter(mission.category === "general" ? "all" : mission.category); setFavoritesOnly(false); navigate("stands"); }}>
          <span className={s.missionArt}><img src={`${ART}${index === 2 ? "stands" : index === 3 ? "rewards" : "missions"}.jpg`} alt="" /><i className={done ? s.completed : ""}><Icon name={done ? "check" : "flag"} size={12} /></i></span>
          <span className={s.grow}><span className={s.missionTitle}><strong>{mission.title}</strong><b className={done ? s.successText : ""}>{value}/{mission.target}</b></span><span className={s.truncate}>{mission.shortDescription}</span>{!done && <Progress value={value} total={mission.target} />}</span>
        </button>;
      })}</div>
      <div className={s.sectionHeading}><h2>Premios</h2><button onClick={() => navigate("rewards")}>Ver todos</button></div><div className={s.rewardsCarousel}>{rewardCards()}</div>
    </div>;
  }
  function profile() {
    return <div className={s.stack}>
      <div className={s.identity}><Badge name="person" /><span className={s.grow}><h2>{state.signedIn ? "Visitante demo" : "Explora Fexpo"}</h2><p>{state.signedIn ? "Sesión de demostración" : "Continúa para guardar tu recorrido"}</p></span><span className={s.levelPill}><Icon name="military_tech" size={16} />Nivel {level}</span></div>
      <div className={s.stats}>{[["stars", points, "Puntos", "var(--m-gold)"], ["storefront", visited.length, "Stands", "var(--m-primary)"], ["emoji_events", completed, "Misiones", "var(--m-success)"], ["military_tech", level, "Nivel", "var(--m-purple)"]].map(([icon, value, label, color]) => <div key={label} className={s.stat}><span style={{ color: String(color) }}><Icon name={icon as IconName} size={25} /></span><span><b>{value}</b><small>{label}</small></span></div>)}</div>
      <div className={`${s.card} ${s.menu}`}>
        {[["qr_code_2", "Mi código QR", "qr", "var(--m-primary)"], ["storefront", "Stands", "stands", "var(--m-coral)"], ["card_giftcard", "Premios", "rewards", "var(--m-purple)"]].map(([icon,label,view,color]) => <button key={view} onClick={() => navigate(view as View)}><Badge name={icon as IconName} color={color} /><strong>{label}</strong><Icon name="chevron_right" /></button>)}
        <button onClick={() => setDialog(state.signedIn ? "logout" : "signin")}><Badge name="account_circle" color="var(--m-secondary)" /><strong>{state.signedIn ? "Cerrar sesión" : "Iniciar sesión demo"}</strong><Icon name="chevron_right" /></button>
      </div>
      <h2>Apariencia</h2><div className={s.themeChoices} aria-label="Apariencia">{(["system", "light", "dark"] as const).map((mode) => <button key={mode} aria-pressed={state.theme === mode} onClick={() => state.setTheme(mode)}>{mode === "system" ? "Sistema" : mode === "light" ? "Claro" : "Oscuro"}</button>)}</div>
      <h2>Visitas</h2><div className={`${s.card} ${s.menu}`}>{state.visits.length ? [...state.visits].reverse().map((visit) => <button key={visit.reference} onClick={() => navigate("stand", visit.standId)}><Badge name="storefront" /><span className={s.grow}><strong>{findStand(visit.standId)?.name}</strong><small>{new Date(visit.at).toLocaleDateString("es-BO", { day: "numeric", month: "short" })} · +50 pts</small></span><span className={s.successText}><Icon name="check_circle" /></span></button>) : <div className={s.empty}><Icon name="storefront" size={30} /><p>Aún no hay visitas</p><button className={s.textButton} onClick={() => navigate("scan")}>Haz tu primer check-in</button></div>}</div>
      <button className={s.resetButton} onClick={() => setDialog("reset")}><Icon name="restart_alt" size={18} />Reiniciar demostración</button><p className={s.demoFootnote}>Experiencia de demostración. Empresas, visitas, puntos y premios ficticios.</p><Link className={s.returnLink} href="/">Volver a la landing</Link>
    </div>;
  }
  function checkin() {
    return <div className={s.checkin}>
      <div className={s.checkinHero}>
        <div className={s.nfcOrbit}><img src={`${ART}checkin.jpg`} alt="Teléfono acercándose a un lector NFC" /></div>
        <h2>{scanSuccess ? "¡Visita registrada!" : "Acerca tu teléfono"}</h2>
        {!scanSuccess && <p>Acércalo al tag del stand para registrar tu visita.</p>}
        {scanSuccess && <span className={s.pointsPill}><Icon name="stars" size={16} />+{scanAwarded} puntos</span>}
        <span className={s.scanPill}><i />{scanSuccess ? "Visita registrada" : "NFC de demostración"}</span>
      </div>
      <div className={s.steps}>{["Activa", "Acerca", "Confirma"].map((label,index) => <span key={label}><b>{index+1}</b>{label}</span>)}</div>
      <label className={s.targetLabel}>Stand de prueba<select value={scanTarget} onChange={(event) => { setScanTarget(event.target.value); setScanSuccess(false); }}>{STANDS.map((stand) => <option key={stand.id} value={stand.id}>{stand.name} · {stand.boothCode}</option>)}</select></label>
      <button className={s.primaryButton} onClick={startScan}><Icon name="contactless" />{scanSuccess ? "Leer otro tag (demo)" : "Simular lectura NFC"}</button>
      <div className={s.buttonRow}><button className={s.softButton} onClick={() => { const next = STANDS.find((stand) => !visited.includes(stand.id)); setScanTarget(next?.id ?? STANDS[0].id); setScanSuccess(false); setNotice(next ? `Stand seleccionado: ${next.name}` : "Ya visitaste los seis stands. Puedes repetir uno para probar los duplicados."); }}><Icon name="touch_app" />Otro stand</button><button className={s.outlineButton} onClick={() => navigate("qr")}><Icon name="qr_code_2" />Mi QR</button></div>
      <p className={s.scanNote}>Simulación web · no requiere un tag NFC físico.</p>
    </div>;
  }
  function qr() {
    if (!state.signedIn) return <div className={s.authPrompt}><Badge name="qr_code_2" /><h2>Tu pase a la feria</h2><p>Inicia la sesión de demostración para mostrar tu QR.</p><button className={s.primaryButton} onClick={() => setDialog("signin")}>Continuar como visitante demo</button></div>;
    return <div className={s.stack}><div className={s.qrIntro}><h2>Tu pase a la feria</h2><p>El stand escanea tu código para registrar la visita.</p></div><div className={s.qrTicket}><span className={s.passHeading}><b>FEXPO</b><span>FIPAZ 2026</span></span><h3>Visitante demo</h3><p>Pase de demostración</p><div className={s.qrCode}>{qrTime > 0 ? <QRCode value={`FEXPO:DEMO:VISITOR:2026:${qrVersion}`} size={210} bgColor="#FFFFFF" fgColor="#1e1c38" title="Código QR de demostración sin validez de acceso" /> : <div className={s.expired}><Icon name="schedule" size={40} /><strong>Código vencido</strong><span>Actualiza tu QR para continuar.</span></div>}</div><span className={s.qrTimer}>{qrTime > 0 ? `Vence en ${qrTime} s` : "Actualización necesaria"}</span><div className={s.ticketTear} /><span className={s.qrReference}>DEMO · FX-2026</span></div><button className={s.primaryButton} onClick={() => { setQrVersion((version) => version+1); setQrTime(60); }}><Icon name="refresh" />Actualizar QR</button><p className={s.demoFootnote}>QR de ejemplo. No concede acceso ni registra visitas reales.</p></div>;
  }
  function stands() {
    return <div className={s.stack}><label className={s.search}><Icon name="search" /><input aria-label="Buscar stands" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar stand, empresa o producto" />{query && <button aria-label="Borrar búsqueda" onClick={() => setQuery("")}><Icon name="close" size={18} /></button>}</label>
      <div className={s.filters} aria-label="Categorías"><button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Todos</button>{CATEGORIES.map((category) => <button key={category.id} aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>{category.label}</button>)}</div>
      <div className={s.sectionHeading}><button className={s.favoriteFilter} aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)}><Icon name="favorite" size={18} />Favoritos</button><button onClick={() => openMap()}><Icon name="map" size={18} />Ver mapa</button></div>
      <p className={s.resultsCount}>{browseStands.length} {browseStands.length === 1 ? "stand" : "stands"} · catálogo de demostración</p>
      {browseStands.length ? standCards() : <div className={`${s.card} ${s.empty}`}><Icon name="search" size={32} /><h3>Sin resultados</h3><p>Prueba otra búsqueda o categoría.</p><button className={s.textButton} onClick={() => { setQuery(""); setFilter("all"); setFavoritesOnly(false); }}>Limpiar filtros</button></div>}
    </div>;
  }
  function standDetail() {
    const catalogStand = findStand(screen.id ?? "");
    const mapStand = mobileMapStands.find((item) => item.id === screen.id && item.demo);
    const stand: Stand | undefined = catalogStand ?? (mapStand && mapStand.category !== "unassigned" ? {
      id: mapStand.id, name: mapStand.name, category: mapStand.category === "food" ? "gastronomy" : mapStand.category,
      description: mapStand.summary, zoneId: `zone-${mapStand.zoneId}`, planId: mapStand.planId ?? "entrance", boothCode: mapStand.code, tags: ["Expositor demo"], points: 0,
    } : undefined);
    if (!stand) return <div className={s.empty}><h2>Stand no disponible</h2><button onClick={() => navigate("stands")}>Ver catálogo</button></div>;
    return <div className={s.stack}><div className={s.standCover} style={{ background: CATEGORY_COLOR[stand.category] }}><Badge name={CATEGORY_ICON[stand.category]} /><span>Stand {stand.boothCode}</span></div><span className={s.categoryPill}>{CATEGORIES.find((item) => item.id === stand.category)?.label}</span><h1>{stand.name}</h1><p>{stand.description}</p><span className={s.location}><Icon name="location_on" size={18} />{zoneName(stand.zoneId)}</span><div className={s.tags}>{stand.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      {(stand.promotion || stand.activity) && <div className={`${s.card} ${s.highlights}`}>{stand.promotion && <div><Icon name="sell" /><span><strong>Beneficio</strong><p>{stand.promotion}</p></span></div>}{stand.activity && <div><Icon name="celebration" /><span><strong>En el stand</strong><p>{stand.activity}</p></span></div>}</div>}
      <button className={s.primaryButton} onClick={() => openMap(stand.id)}><Icon name="map" />Ver en el mapa</button>{catalogStand && <div className={s.buttonRow}><button className={s.outlineButton} aria-pressed={state.favorites.includes(stand.id)} onClick={() => state.toggleFavorite(stand.id)}><Icon name="favorite" />{state.favorites.includes(stand.id) ? "Guardado" : "Guardar"}</button><button className={s.softButton} onClick={() => { setScanTarget(stand.id); setScanSuccess(false); navigate("scan"); }}><Icon name="contactless" />Check-in</button></div>}
      <h2>Actividades</h2><div className={s.card}><p>{stand.activity ?? "Este stand no tiene actividades programadas."}</p></div><p className={s.demoFootnote}>Empresa ficticia · ubicación ilustrativa, sujeta a confirmación.</p></div>;
  }
  function eventDetail() {
    const event = EVENTS.find((item) => item.id === screen.id);
    if (!event) return <div className={s.empty}><h2>Feria no disponible</h2><button onClick={() => navigate("home")}>Volver a Inicio</button></div>;
    return <div className={s.eventDetail}><img className={event.canExplore ? s.eventCover : s.previewCover} src={`${EVENT_ART}${event.cover}`} alt={`Portada ${event.name}`} /><div className={s.eventDetailContent}><span className={s.categoryPill}>{now ? eventStatus(event, now) : "Próximamente"}</span><h1>{event.name} {event.edition}</h1><h2>{event.lead}</h2><p>{event.description}</p><p className={s.location}><Icon name="calendar_month" size={20} />{event.date} · 2026</p><p className={s.location}><Icon name="location_on" size={20} />{event.venue}</p>{event.canExplore ? <button className={s.primaryButton} onClick={() => openMap()}><Icon name="map" />Explorar la feria</button> : <div className={s.card}><Icon name="schedule" /><p>Contenido de la feria próximamente.</p></div>}<button className={s.outlineButton} onClick={() => navigate("home")}>Ver otras ferias</button></div></div>;
  }

  return <div className={s.stage}>
    <div className={s.desktopIntro}><Link href="/">← Volver a la landing</Link><span>FEXPO · DEMO INTERACTIVA</span><p>Explora. Conecta.<br /><strong>Vive la feria.</strong></p><small>La experiencia móvil, desde tu navegador.</small></div>
    <div className={s.phone} data-theme={dark ? "dark" : "light"} data-testid="mobile-demo">
      <div className={s.deviceStatus} aria-hidden="true"><b>9:41</b><span>▂▄▆ ● ▰</span></div>
      <header className={`${s.topBar} ${screen.view === "home" ? s.homeBar : ""}`}>
        {secondary ? <button className={s.backButton} aria-label="Volver" onClick={() => navigate(screen.view === "stand" ? "stands" : screen.view === "qr" ? "profile" : screen.view === "rewards" ? "missions" : "home")}><Icon name="arrow_back" /></button> : screen.view === "home" ? <span className={s.brandMark}>F</span> : null}
        <h1>{heading}</h1><button className={s.pointsPill} onClick={() => navigate("missions")} aria-label={`${points} puntos`}><Icon name="stars" size={18} />{points}</button><button className={s.qrButton} aria-label="Abrir mi código QR" onClick={() => navigate("qr")}><Icon name="qr_code_2" /></button>
      </header>
      <main ref={content} id="mobile-demo-content" className={`${s.content} ${screen.view === "map" ? s.mapContent : ""} ${screen.view === "scan" ? s.scanContent : ""}`} aria-label={heading}>
        {!state.hydrated ? <div className={s.loading} role="status">Preparando tu experiencia…</div> : <>
          {screen.view === "home" && home()}{screen.view === "missions" && missions()}{screen.view === "profile" && profile()}{screen.view === "scan" && checkin()}{screen.view === "qr" && qr()}{screen.view === "stands" && stands()}{screen.view === "stand" && standDetail()}{screen.view === "event" && eventDetail()}
          {screen.view === "rewards" && <div className={s.stack}><h2>Convierte tus puntos en experiencias</h2><p>Tienes {points} puntos de demostración.</p><div className={s.rewardGrid}>{rewardCards()}</div><p className={s.demoFootnote}>Los canjes son ficticios y no generan pedidos reales.</p></div>}
          {screen.view === "map" && <div className={s.mapWrapper}><ExpoInteractiveMap key={mapZone ?? "venue"} embedded stands={mobileMapStands} selectedStandId={mapSelected} visitedStandIds={visited} initialZoneId={mapZone} onSelectStand={setMapSelected} onOpenStand={(id) => navigate("stand", id)} OverviewComponent={VenueOverview} /></div>}
        </>}
      </main>
      <nav className={s.bottomNav} aria-label="Navegación principal">{TABS.map((tab) => <button key={tab.view} onClick={() => navigate(tab.view)} aria-current={activeTab === tab.view ? "page" : undefined} className={tab.view === "scan" ? s.primaryTab : ""}><span><Icon name={tab.icon} size={23} /></span><small>{tab.label}</small></button>)}</nav>
      <div className={s.deviceHome} aria-hidden="true"><i /></div>
      {notice && <div className={s.toast} role="status">{notice}</div>}
      {scanning && <Modal label="Lectura NFC de demostración" onClose={cancelScan}><div className={s.scanModal}><div className={`${s.nfcOrbit} ${s.scanning}`}><img src={`${ART}checkin.jpg`} alt="" /></div><h2>Buscando tag…</h2><p>Simulando lectura en {findStand(scanTarget)?.name}.</p><button className={s.outlineButton} onClick={cancelScan}>Cancelar lectura</button></div></Modal>}
      {receipt && receiptStand && <Modal label="Comprobante de visita" onClose={() => setReceipt(null)} receipt><h2 className={s.receiptHeading}>{receipt.duplicate ? "Ya la tenías" : "¡Visita registrada!"}</h2><div className={s.receiptPaper}><div className={s.receiptBrand}><b>F</b><span>F E X P O</span><Icon name="verified" size={38} /></div><h3>{receipt.duplicate ? "Visita ya registrada" : "Check-in exitoso"}</h3><p className={s.receiptPoints}>+{receipt.duplicate ? 0 : 50}<span> pts</span></p><small>{receiptVisit && new Date(receiptVisit.at).toLocaleString("es-BO")}</small><hr /><dl>{[["Stand",receiptStand.name],["Ubicación",`Stand ${receiptStand.boothCode}`],["Feria","FIPAZ 2026"],["Método","NFC simulado"],["Nro. de registro",receiptVisit?.reference ?? "DEMO"]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className={s.demoFootnote}>Comprobante de demostración</p></div><div className={s.buttonRow}><button className={s.outlineButton} onClick={async () => { const text = `Visita demo a ${receiptStand.name} · Fexpo · ${receiptVisit?.reference}`; try { if (navigator.share) await navigator.share({ title: "Mi recorrido Fexpo", text }); else { await navigator.clipboard.writeText(text); setNotice("Comprobante copiado."); } } catch { setNotice("No se compartió el comprobante."); } }}><Icon name="share" />Compartir</button><button className={s.outlineButton} onClick={() => { setReceipt(null); navigate("stand", receiptStand.id); }}><Icon name="storefront" />Ver stand</button></div><button className={s.yellowButton} onClick={() => setReceipt(null)}>Listo</button></Modal>}
      {reward && <Modal label="Detalle del premio" onClose={() => setSelectedReward(null)}><img className={s.rewardDetailArt} src={`${ART}rewards.jpg`} alt="Trofeo dorado y regalo" /><h2>{reward.title}</h2><p>{reward.description}</p><span className={s.categoryPill}>{reward.stockLabel}</span><p className={s.rewardCost}>{reward.cost} pts <small>· disponibles: {points}</small></p>{state.redeemed.includes(reward.id) ? <div className={s.redeemed} role="status"><Icon name="check_circle" /><strong>Premio canjeado</strong><p>Código de ejemplo: DEMO-{reward.id.replace("reward-", "").toUpperCase()}</p></div> : <button className={s.primaryButton} disabled={points < reward.cost} onClick={() => needAuth(() => { if (state.redeem(reward.id)) setNotice("Canje de demostración registrado."); })}>{points < reward.cost ? `Te faltan ${reward.cost-points} puntos` : "Confirmar canje demo"}</button>}<p className={s.demoFootnote}>Este canje es una simulación.</p></Modal>}
      {dialog && <Modal label={dialog === "signin" ? "Sesión demo" : dialog === "logout" ? "Cerrar sesión" : "Reiniciar demo"} onClose={() => setDialog(null)}><Badge name={dialog === "signin" ? "person" : "restart_alt"} /><h2>{dialog === "signin" ? "Tu recorrido empieza aquí" : dialog === "logout" ? "¿Cerrar la sesión demo?" : "¿Empezar de nuevo?"}</h2><p>{dialog === "signin" ? "Prueba las visitas, el QR y los premios con un visitante de demostración." : dialog === "logout" ? "Tus visitas se conservarán en este navegador." : "Se borrarán las visitas, favoritos y canjes de esta demostración."}</p><button className={s.primaryButton} onClick={() => { if (dialog === "reset") { state.reset(); setScanSuccess(false); } else state.setSignedIn(dialog === "signin"); setDialog(null); }}>{dialog === "signin" ? "Continuar como visitante demo" : dialog === "logout" ? "Cerrar sesión" : "Reiniciar demostración"}</button><button className={s.outlineButton} onClick={() => setDialog(null)}>Cancelar</button></Modal>}
    </div>
    <Link className={s.mobileExit} href="/">Volver a la landing</Link>
  </div>;
}
