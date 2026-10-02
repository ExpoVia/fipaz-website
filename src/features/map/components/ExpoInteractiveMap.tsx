"use client";

import { ArrowLeft, Check, List, LocateFixed, Minus, Plus, RotateCcw, Route, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { categoryMeta, expoStands, mapPlans, poiMeta, routeDefinitions, zones } from "../data/expoMapData";
import type { ExpoMapProps, PoiType, StandCategory } from "../types";
import { ExpoMapSvg } from "./ExpoMapSvg";
import styles from "./map.module.css";

const allCategories = categoryMeta.map((category) => category.id);
const allPoiTypes = poiMeta.map((poi) => poi.id);
function toggle<T extends string>(items: T[], item: T) { return items.includes(item) ? items.filter((value) => value !== item) : [...items, item]; }
function resolvePlan(id?: string | null) { return mapPlans.find((plan) => plan.id === id || plan.zoneId === id)?.id ?? null; }
function IconButton({ label, children, onClick, pressed }: { label: string; children: ReactNode; onClick: () => void; pressed?: boolean }) {
  return <button type="button" aria-label={label} title={label} aria-pressed={pressed} className={styles.iconButton} onClick={onClick}>{children}</button>;
}

export function ExpoInteractiveMap({ stands, selectedStandId, visitedStandIds, onSelectStand, onOpenStand, initialZoneId = null }: ExpoMapProps) {
  const idPrefix = useId().replaceAll(":", "");
  const [planId, setPlanId] = useState<string | null>(() => resolvePlan(stands.find((stand) => stand.id === selectedStandId)?.planId ?? initialZoneId));
  const [scale, setScale] = useState(1);
  const [activeCategories, setActiveCategories] = useState<StandCategory[]>(allCategories);
  const [activePoiTypes, setActivePoiTypes] = useState<PoiType[]>(allPoiTypes);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(selectedStandId);
  const [previousSelectedId, setPreviousSelectedId] = useState(selectedStandId);
  const [panel, setPanel] = useState<"filters" | "list" | null>(null);
  const [query, setQuery] = useState("");
  const [reducedMotion, setReducedMotion] = useState(true);
  const [compact, setCompact] = useState(true);
  const transform = useRef<ReactZoomPanPinchRef | null>(null);
  const root = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const pendingFocus = useRef<string | null>(selectedStandId ? `stand-${selectedStandId}` : initialZoneId ? "floor-outline" : null);
  const returnFocus = useRef<HTMLElement | SVGElement | null>(null);

  // Synchronize controlled selection, while allowing the sheet to close locally.
  if (previousSelectedId !== selectedStandId) {
    setPreviousSelectedId(selectedStandId);
    setSheetId(selectedStandId);
    setRouteId(null);
    const selected = stands.find((stand) => stand.id === selectedStandId);
    if (selected?.planId && resolvePlan(selected.planId)) {
      setPlanId(selected.planId);
      setActiveCategories((items) => items.includes(selected.category) ? items : [...items, selected.category]);
    }
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 700));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (sheetId) closeButton.current?.focus({ preventScroll: true });
  }, [sheetId]);

  const plan = mapPlans.find((item) => item.id === planId) ?? null;
  const selectedStand = stands.find((stand) => stand.id === sheetId && stand.planId === planId) ?? null;
  const activeRoute = routeDefinitions.find((route) => route.standId === routeId && route.planId === planId) ?? null;
  const availableRoute = routeDefinitions.find((route) => route.standId === sheetId && route.planId === planId);
  const duration = reducedMotion ? 0 : 280;
  const results = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return stands.filter((stand) => (!planId || stand.planId === planId) && activeCategories.includes(stand.category) && (!search || `${stand.code} ${stand.name}`.toLocaleLowerCase().includes(search)));
  }, [stands, planId, activeCategories, query]);

  function zoomTo(id: string, zoom: number, time = duration) {
    const target = root.current?.querySelector(`[id="${CSS.escape(`${idPrefix}-${id}`)}"]`);
    if (target) void transform.current?.zoomToElement(target.id, { scale: zoom, animationTime: time, offsetY: sheetId ? -75 : 0 });
  }
  function changePlan(id: string | null) {
    setPlanId(id); setSheetId(null); setRouteId(null); setPanel(null); setQuery(""); setScale(1);
    pendingFocus.current = id ? "floor-outline" : null;
  }
  function focusStand(id: string) {
    const stand = stands.find((item) => item.id === id);
    if (!stand?.planId || !resolvePlan(stand.planId)) return;
    returnFocus.current = document.activeElement as HTMLElement | SVGElement;
    setPanel(null); setSheetId(id); setRouteId(null);
    if (stand.planId !== planId) { pendingFocus.current = `stand-${id}`; setPlanId(stand.planId); }
    else zoomTo(`stand-${id}`, 3.2);
    onSelectStand(id);
  }
  function closeSheet() {
    setSheetId(null); setRouteId(null);
    if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    else root.current?.querySelector<SVGElement>(`[id="${CSS.escape(`${idPrefix}-stand-${sheetId}`)}"]`)?.focus({ preventScroll: true });
  }

  return <section ref={root} className={styles.root} aria-label="Mapa FIPAZ 2026" onKeyDown={(event) => {
    if (event.key === "Escape") { if (panel) setPanel(null); else closeSheet(); }
  }}>
    <header className={styles.header}>
      <div className={styles.heading}>
        <div><h1>FIPAZ 2026</h1><p className={styles.muted}>Mapa demostrativo · Referencias proporcionadas</p></div>
        <div style={{ display: "flex", gap: 5 }}>
          <IconButton label="Buscar espacios" pressed={panel === "list"} onClick={() => setPanel(panel === "list" ? null : "list")}><List size={18} /></IconButton>
          <IconButton label="Filtros" pressed={panel === "filters"} onClick={() => setPanel(panel === "filters" ? null : "filters")}><SlidersHorizontal size={18} /></IconButton>
        </div>
      </div>
      <p className={styles.demoNotice}>Datos de demostración · expositores, ubicaciones y visitas simulados</p>
      <div className={styles.row}>
        {plan && <IconButton label="Volver al recinto" onClick={() => changePlan(null)}><ArrowLeft size={18} /></IconButton>}
        <select aria-label="Bloque o plaza" className={styles.select} value={plan?.zoneId ?? ""} onChange={(event) => changePlan(resolvePlan(event.target.value))}>
          <option value="">Todo el recinto</option>
          {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
          <option value="entrance">Plaza Akapana · Ingreso</option><option value="food">Patio de comidas</option>
        </select>
      </div>
      {plan && <>
        <div className={styles.row}><div className={styles.tabs} aria-label="Planta">
          {mapPlans.filter((item) => item.zoneId === plan.zoneId).map((item) => <button type="button" key={item.id} aria-pressed={item.id === planId} onClick={() => { if (item.id !== planId) changePlan(item.id); }}>{item.level}</button>)}
        </div></div>
        <p className={styles.title} aria-live="polite">{plan.name}</p>
      </>}
    </header>

    <div className={styles.canvas}>
      <TransformWrapper key={planId ?? "overview"} ref={transform} centerOnInit initialScale={1} minScale={1} maxScale={4} wheel={{ step: .16 }} doubleClick={{ mode: "zoomIn", animationTime: duration }} zoomAnimation={{ disabled: reducedMotion }} autoAlignment={{ animationTime: duration, velocityAlignmentTime: duration }} velocityAnimation={{ disabled: reducedMotion }} onTransform={(_, state) => setScale(state.scale)} onInit={(ref) => {
        transform.current = ref;
        const target = pendingFocus.current;
        if (target) {
          requestAnimationFrame(() => {
            zoomTo(target, target === "floor-outline" ? 1.5 : target === "you-are-here" ? 2.4 : 3.2, 0);
          });
          pendingFocus.current = null;
        }
      }}>
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
          <ExpoMapSvg compact={compact} idPrefix={idPrefix} plan={plan} stands={stands} selectedStandId={sheetId} visitedStandIds={visitedStandIds} activeCategories={activeCategories} activePoiTypes={activePoiTypes} zoomLevel={scale >= 2.4 ? "stand" : scale >= 1.5 ? "zone" : "general"} activeRoute={activeRoute} reducedMotion={reducedMotion} onPlanPress={changePlan} onStandPress={focusStand} />
        </TransformComponent>
      </TransformWrapper>
      <span className={styles.zoom} data-testid="map-zoom">{scale.toFixed(1)}x</span>
      <div className={styles.controls}>
        <IconButton label="Acercar" onClick={() => { void transform.current?.zoomIn(.5, duration); }}><Plus size={18} /></IconButton>
        <IconButton label="Alejar" onClick={() => { void transform.current?.zoomOut(.5, duration); }}><Minus size={18} /></IconButton>
        <IconButton label="Centrar" onClick={() => { void transform.current?.resetTransform(duration); }}><RotateCcw size={17} /></IconButton>
        <IconButton label="Ver acceso simulado" onClick={() => {
          setSheetId(null); setRouteId(null);
          if (!plan) { changePlan("entrance"); pendingFocus.current = "you-are-here"; }
          else zoomTo("you-are-here", 2.4);
        }}><LocateFixed size={18} /></IconButton>
      </div>
    </div>
    <footer className={styles.footer}><span>{plan ? `${results.length} espacios de ejemplo` : "3 bloques · 7 planos de referencia"}</span><span><span className={styles.dot} />{plan ? "Acceso simulado · recinto sujeto a confirmación" : "Recinto sujeto a confirmación"}</span></footer>

    {panel && <aside className={styles.panel} aria-label={panel === "filters" ? "Filtros del mapa" : "Directorio de espacios"}>
      <div className={styles.panelTitle}>{panel === "filters" ? "Filtros" : "Espacios"}<IconButton label="Cerrar panel" onClick={() => setPanel(null)}><X size={16} /></IconButton></div>
      {panel === "filters" ? <>
        <fieldset><legend>Rubros</legend>{categoryMeta.map((meta) => <label key={meta.id} className={styles.check}><input type="checkbox" checked={activeCategories.includes(meta.id)} onChange={() => { setActiveCategories(toggle(activeCategories, meta.id)); closeSheet(); }} />{meta.label}</label>)}</fieldset>
        <fieldset><legend>Servicios</legend>{poiMeta.map((meta) => <label key={meta.id} className={styles.check}><input type="checkbox" checked={activePoiTypes.includes(meta.id)} onChange={() => setActivePoiTypes(toggle(activePoiTypes, meta.id))} /><meta.icon size={15} />{meta.label}</label>)}</fieldset>
        <button className={styles.command} type="button" onClick={() => { setActiveCategories(allCategories); setActivePoiTypes(allPoiTypes); }}><RotateCcw size={15} />Restablecer</button>
      </> : <>
        <label className={styles.search}><Search size={16} /><input aria-label="Numero o expositor" placeholder="Numero o expositor" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className={styles.results}>{results.map((stand) => <button type="button" key={stand.id} className={styles.result} onClick={() => focusStand(stand.id)}>
          <span className={styles.code}>{stand.code}</span><span>{stand.name}{stand.demo ? " (demo)" : ""}<small>{mapPlans.find((item) => item.id === stand.planId)?.name}</small></span>{visitedStandIds.includes(stand.id) && <Check size={15} aria-label="Visitado" />}
        </button>)}{results.length === 0 && <p className={styles.muted}>Sin resultados.</p>}</div>
      </>}
    </aside>}

    {selectedStand && <aside className={styles.sheet} aria-label="Ficha del espacio">
      <div className={styles.heading}><div><span className={styles.muted}>{plan?.name} · {plan?.level} · Espacio {selectedStand.code}</span><h2>{selectedStand.name}</h2></div><button ref={closeButton} type="button" className={styles.iconButton} aria-label="Cerrar ficha" title="Cerrar ficha" onClick={closeSheet}><X size={18} /></button></div>
      <p>{selectedStand.summary}</p>
      {selectedStand.area !== undefined && <p>Superficie indicada: {selectedStand.area} m²</p>}
      <div className={styles.row} style={{ flexWrap: "wrap" }}>
        <button type="button" className={styles.command} disabled={!availableRoute} onClick={() => {
          if (!availableRoute) return;
          setRouteId(availableRoute.standId);
          requestAnimationFrame(() => {
            void transform.current?.zoomToElement([`${idPrefix}-route`, `${idPrefix}-stand-${availableRoute.standId}`], { minScale: 1, maxScale: 1.25, animationTime: duration, offsetY: -100 });
          });
        }}><Route size={16} />Como llegar</button>
        {selectedStand.demo && <button type="button" className={styles.command} onClick={() => onOpenStand(selectedStand.id)}>Ver expositor</button>}
        {activeRoute && <button type="button" className={styles.command} onClick={() => setRouteId(null)}><X size={15} />Cancelar ruta</button>}
      </div>
      <p className={styles.muted} role="status">{activeRoute ? `Ruta aproximada de demostracion. ${activeRoute.instruction}` : availableRoute ? "Origen simulado: acceso de este plano." : "Ruta demostrativa no disponible para este espacio."}</p>
    </aside>}
  </section>;
}

export function ExpoMapDemoScreen() {
  const [selectedStandId, setSelectedStandId] = useState<string | null>(null);
  const [openStandId, setOpenStandId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const openStand = expoStands.find((stand) => stand.id === openStandId);
  const openPlan = mapPlans.find((plan) => plan.id === openStand?.planId);
  useEffect(() => {
    if (openStandId) dialog.current?.showModal();
  }, [openStandId]);
  return <>
    <ExpoInteractiveMap stands={expoStands} selectedStandId={selectedStandId} visitedStandIds={[]} onSelectStand={setSelectedStandId} onOpenStand={setOpenStandId} />
    <dialog ref={dialog} className={styles.exhibitorDialog} aria-label="Expositor demostrativo" onClose={() => setOpenStandId(null)}>
      {openStand && <>
        <div className={styles.heading}><div><p className={styles.muted}>Expositor demostrativo</p><h2>{openStand.name}</h2></div><IconButton label="Cerrar expositor" onClick={() => dialog.current?.close()}><X size={18} /></IconButton></div>
        <p>{openStand.summary}</p>
        <dl><dt>Ubicacion</dt><dd>{openPlan?.name} · {openPlan?.level} · Espacio {openStand.code}</dd><dt>Rubro</dt><dd>{categoryMeta.find((category) => category.id === openStand.category)?.label}</dd></dl>
        <button type="button" className={styles.command} onClick={() => dialog.current?.close()}><ArrowLeft size={16} />Volver al mapa</button>
      </>}
    </dialog>
  </>;
}
