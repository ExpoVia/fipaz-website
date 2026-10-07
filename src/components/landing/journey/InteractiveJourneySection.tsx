"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import dynamic from "next/dynamic";
import { autoUpdate, offset, shift, size, useFloating } from "@floating-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronDown, MousePointer2, Pin, X } from "lucide-react";
import { demoCompanies, journeyCopy, journeyOverlayQuery, journeySteps, type DemoCompany, type JourneyStep, type JourneyStepId } from "./journey-data";
import { useMediaQuery } from "./use-media-query";
import styles from "./InteractiveJourneySection.module.css";

const demoLoading = () => <p className={styles.loading} role="status">Preparando la demo…</p>;
const SearchDemo = dynamic(() => import("./JourneyDemos").then(module => module.SearchDemo), { loading: demoLoading });
const MapDemo = dynamic(() => import("./JourneyDemos").then(module => module.MapDemo), { loading: demoLoading });
const RouteDemo = dynamic(() => import("./JourneyDemos").then(module => module.RouteDemo), { loading: demoLoading });
const NFCDemo = dynamic(() => import("./JourneyDemos").then(module => module.NFCDemo), { loading: demoLoading });
const RewardDemo = dynamic(() => import("./JourneyDemos").then(module => module.RewardDemo), { loading: demoLoading });
const ConnectDemo = dynamic(() => import("./JourneyDemos").then(module => module.ConnectDemo), { loading: demoLoading });

function floatingViewport() {
  const top = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
  return { x: 0, y: top, width: window.innerWidth, height: window.innerHeight - top };
}

function JourneyHeader() {
  const [before, after] = journeyCopy.title.split(journeyCopy.accentWord);
  return <header className={styles.header}>
    <span className={styles.eyebrow} data-solution-reveal="eyebrow"><span aria-hidden="true">✦</span> {journeyCopy.eyebrow}</span>
    <h2 className={styles.heading} data-solution-reveal="title">{before}<span>{journeyCopy.accentWord}</span>{after}</h2>
    <p className={styles.subtitle} data-solution-reveal="subtitle">{journeyCopy.subtitle}</p>
  </header>;
}

function JourneyCards({ children }: { children: ReactNode }) {
  return <ol className={styles.cards} aria-label="Seis pasos de tu recorrido">{children}</ol>;
}

type JourneyCardProps = {
  step: JourneyStep; active: boolean; pinned: boolean; tilt: boolean; panelId: string; triggerId: string;
  onPreview: () => void; onLeave: () => void; onActivate: (keyboard: boolean) => void;
};

function JourneyCard({ step, active, pinned, tilt, panelId, triggerId, onPreview, onLeave, onActivate }: JourneyCardProps) {
  const Icon = step.icon;
  const button = useRef<HTMLButtonElement>(null);
  const tiltTo = useRef<{ x: (value: number) => void; y: (value: number) => void } | null>(null);

  // The card tilts towards the cursor, like the problem cards above. The lift, scale and dimming are driven by the
  // section-level tween on `y`/`scale`/`opacity`; rotationX/Y are separate properties, so the two compose.
  useLayoutEffect(() => {
    const element = button.current;
    if (!element || !tilt) return;
    gsap.set(element, { transformPerspective: 900 });
    tiltTo.current = {
      x: gsap.quickTo(element, "rotationX", { duration: 0.5, ease: "power3.out" }),
      y: gsap.quickTo(element, "rotationY", { duration: 0.5, ease: "power3.out" }),
    };
    return () => { tiltTo.current = null; gsap.set(element, { rotationX: 0, rotationY: 0 }); };
  }, [tilt]);

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse" || !tiltTo.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    tiltTo.current.y((x - 0.5) * 16);
    tiltTo.current.x(-(y - 0.5) * 12);
    event.currentTarget.style.setProperty("--mx", `${x * 100}%`);
    event.currentTarget.style.setProperty("--my", `${y * 100}%`);
  };

  return <button ref={button} type="button" id={triggerId} className={styles.card} data-journey-card data-active={active} data-pinned={pinned}
    aria-expanded={active} aria-controls={panelId} onPointerEnter={event => { if (event.pointerType === "mouse") onPreview(); }} onPointerMove={onPointerMove}
    onPointerLeave={() => { tiltTo.current?.x(0); tiltTo.current?.y(0); onLeave(); }}
    onClick={event => onActivate(event.detail === 0)}>
    <span className={styles.cardTop}><span className={styles.cardIcon} data-journey-icon><Icon size={21} strokeWidth={2} aria-hidden="true" /></span><span className={styles.number}>{step.number}</span></span>
    <span className={styles.cardTitle}>{step.title}</span><span className={styles.cardDescription}>{step.description}</span>
    <span className={styles.cardFooter}><span>{pinned ? "Demo fijada" : "Explorar"}</span><ArrowRight size={15} data-journey-arrow aria-hidden="true" /><ChevronDown size={17} className={styles.accordionChevron} aria-hidden="true" /></span>
  </button>;
}

type DemoPanelProps = {
  stepId: JourneyStepId; id: string; labelledBy: string; pinned: boolean; reduced: boolean; compact: boolean;
  company: DemoCompany; saved: boolean; onSelect: (company: DemoCompany) => void; onSave: () => void;
  onNext: (id: JourneyStepId) => void; onClose: () => void; onPin: () => void; onEnter: () => void; onLeave: () => void;
};

function InteractiveDemoPanel({ stepId, id, labelledBy, pinned, reduced, compact, company, saved, onSelect, onSave, onNext, onClose, onPin, onEnter, onLeave }: DemoPanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [displayedStep, setDisplayedStep] = useState(stepId);
  const step = journeySteps.find(item => item.id === displayedStep)!;

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.fromTo(panel.current, { opacity: 0, y: compact ? 8 : 22, scale: compact ? 1 : 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out", clearProps: "transform,opacity" });
    }, panel);
    return () => context.revert();
  }, [compact, reduced]);

  useLayoutEffect(() => {
    const tween = displayedStep === stepId
      ? gsap.to(content.current, { opacity: 1, y: 0, duration: reduced ? 0 : 0.22, ease: "power2.out" })
      : gsap.to(content.current, { opacity: 0, y: reduced ? 0 : -8, duration: reduced ? 0 : 0.18, ease: "power2.out", onComplete: () => { gsap.set(content.current, { y: reduced ? 0 : 8 }); setDisplayedStep(stepId); } });
    return () => { tween.kill(); };
  }, [stepId, displayedStep, reduced]);

  return <div ref={panel} id={id} tabIndex={-1} role="region" aria-labelledby={labelledBy} className={styles.panel} data-demo-panel data-lenis-prevent
    style={{ "--accent": step.color } as CSSProperties} onPointerEnter={onEnter} onPointerLeave={onLeave} onFocusCapture={onPin}>
    <div className={styles.panelToolbar}><span><span className={styles.panelDot} /> {pinned ? "DEMO FIJADA" : "VISTA PREVIA"}</span>
      {pinned ? <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Cerrar demo"><X size={16} /></button> : <button type="button" className={styles.pinButton} onClick={onPin}><Pin size={12} aria-hidden="true" /> Fijar demo</button>}
    </div>
    <div ref={content} className={styles.panelContent}>
      <div className={styles.panelHeading}><h3>{step.demoTitle}</h3><p>{step.demoDescription}</p></div>
      <div key={`${displayedStep}-${reduced}`}>
        {displayedStep === "search" && <SearchDemo reduced={reduced} onSelect={onSelect} />}
        {displayedStep === "map" && <MapDemo reduced={reduced} company={company} onNext={onNext} />}
        {displayedStep === "route" && <RouteDemo reduced={reduced} company={company} onNext={onNext} />}
        {displayedStep === "nfc" && <NFCDemo reduced={reduced} company={company} onNext={onNext} />}
        {displayedStep === "reward" && <RewardDemo reduced={reduced} company={company} onNext={onNext} />}
        {displayedStep === "connect" && <ConnectDemo company={company} saved={saved} onSave={onSave} />}
      </div>
    </div>
  </div>;
}

function ConnectionLine({ root, reference, floating, active, reduced, x, y }: {
  root: RefObject<HTMLElement | null>; reference: Element | null; floating: HTMLElement | null; active: JourneyStep; reduced: boolean; x: number; y: number;
}) {
  const path = useRef<SVGPathElement>(null);
  const drawnStep = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!reference || !floating || !root.current || !path.current) return;
    const base = root.current.getBoundingClientRect();
    const card = reference.getBoundingClientRect();
    const panel = floating.getBoundingClientRect();
    const startX = card.left + card.width / 2 - base.left;
    const startY = card.top - base.top - 8;
    const endX = Math.max(panel.left + 24, Math.min(card.left + card.width / 2, panel.right - 24)) - base.left;
    const endY = panel.bottom - base.top;
    path.current.setAttribute("d", `M${startX},${startY} C${startX},${endY + 16} ${endX},${startY - 16} ${endX},${endY}`);
    const length = path.current.getTotalLength();
    const animate = drawnStep.current !== active.id && !reduced;
    drawnStep.current = active.id;
    const tween = gsap.fromTo(path.current, { strokeDasharray: length, strokeDashoffset: animate ? length : 0 }, { strokeDashoffset: 0, duration: animate ? 0.32 : 0, ease: "power2.out" });
    return () => { tween.kill(); };
  }, [root, reference, floating, active.id, reduced, x, y]);
  return <svg className={styles.connection} aria-hidden="true"><path ref={path} fill="none" stroke={active.color} strokeWidth="2" opacity="0.5" /></svg>;
}

export function InteractiveJourneySection({ variant }: { variant: "overlay" | "standalone" }) {
  const root = useRef<HTMLElement>(null);
  const cards = useRef<Partial<Record<JourneyStepId, HTMLLIElement>>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusPending = useRef(false);
  const prefix = useId();
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null);
  const [hoveredStep, setHoveredStep] = useState<JourneyStepId | null>(null);
  const [pinnedStep, setPinnedStep] = useState<JourneyStepId | null>(null);
  const [company, setCompany] = useState<DemoCompany>(demoCompanies[1]);
  const [savedCompanies, setSavedCompanies] = useState<string[]>([]);
  const activeStep = pinnedStep ?? hoveredStep;
  const active = journeySteps.find(step => step.id === activeStep);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useMediaQuery("(max-width: 1100px), (max-height: 739px), (pointer: coarse)");
  const overlayMode = useMediaQuery(journeyOverlayQuery);
  const enabled = variant === "overlay" ? overlayMode : !overlayMode;
  const activeIndex = journeySteps.findIndex(step => step.id === activeStep);
  const { refs: { setReference, setFloating }, elements, floatingStyles, x, y } = useFloating({
    open: Boolean(active && !compact), placement: activeIndex < 2 ? "top-start" : activeIndex > 3 ? "top-end" : "top",
    whileElementsMounted: autoUpdate,
    middleware: [offset(28), shift(() => ({ boundary: boundary ?? undefined, rootBoundary: floatingViewport(), crossAxis: true, padding: 4 })), size(() => ({
      boundary: boundary ?? undefined, rootBoundary: floatingViewport(), padding: 4,
      apply({ availableHeight, elements }) { if (boundary) elements.floating.style.setProperty("--panel-max-height", `${Math.max(0, Math.min(boundary.clientHeight - 8, availableHeight))}px`); },
    }))],
  });

  const cancelClose = useCallback(() => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  const close = useCallback((restoreFocus = false) => {
    cancelClose();
    if (restoreFocus && activeStep) cards.current[activeStep]?.querySelector("button")?.focus({ preventScroll: true });
    setPinnedStep(null); setHoveredStep(null);
  }, [activeStep, cancelClose]);
  const scheduleClose = () => {
    if (pinnedStep || compact) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setHoveredStep(null), 240);
  };
  const selectStep = (id: JourneyStepId) => { cancelClose(); setHoveredStep(null); setPinnedStep(id); };

  useEffect(() => () => cancelClose(), [cancelClose]);
  useEffect(() => {
    const element = root.current;
    const hide = () => close(false);
    const layout = window.matchMedia(journeyOverlayQuery);
    element?.addEventListener("journey-hide", hide);
    layout.addEventListener("change", hide);
    if (!activeStep) return () => { element?.removeEventListener("journey-hide", hide); layout.removeEventListener("change", hide); };
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const inside = element?.contains(event.target) && event.target.closest("[data-journey-card], [data-demo-panel]");
      if (!inside) close(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); close(true); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); element?.removeEventListener("journey-hide", hide); layout.removeEventListener("change", hide); };
  }, [activeStep, close]);

  useLayoutEffect(() => {
    setReference(activeStep && !compact ? cards.current[activeStep] ?? null : null);
    if (!focusPending.current) return;
    const frame = requestAnimationFrame(() => {
      root.current?.querySelector<HTMLElement>("[data-demo-panel]")?.focus({ preventScroll: true });
      if (compact && activeStep) cards.current[activeStep]?.scrollIntoView({ block: "start", behavior: "instant" });
      focusPending.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [activeStep, pinnedStep, compact, setReference]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const buttons = gsap.utils.toArray<HTMLElement>("[data-journey-card]", root.current);
    const icons = gsap.utils.toArray<HTMLElement>("[data-journey-icon]", root.current);
    const arrows = gsap.utils.toArray<HTMLElement>("[data-journey-arrow]", root.current);
    const duration = reduced || compact ? 0 : 0.28;
    const tween = gsap.to(buttons, { y: index => activeIndex === index && !reduced && !compact ? -12 : 0, scale: index => !active || reduced || compact || index === activeIndex ? 1 : 0.99,
      opacity: index => !active || compact || index === activeIndex ? 1 : 0.72, duration, ease: "power2.out", overwrite: "auto",
      onStart: () => buttons.forEach(button => { button.style.willChange = "transform,opacity"; }), onComplete: () => buttons.forEach(button => { button.style.willChange = ""; }),
    });
    // Icon tips and pops with a small overshoot, the arrow slides: same as the problem cards above.
    const iconTween = gsap.to(icons, { rotation: index => !reduced && !compact && index === activeIndex ? -10 : 0, scale: index => !reduced && !compact && index === activeIndex ? 1.12 : 1, duration: duration && 0.4, ease: "back.out(2.2)" });
    const arrowTween = gsap.to(arrows, { x: index => !reduced && !compact && index === activeIndex ? 5 : 0, duration, ease: "power2.out" });
    return () => { tween.kill(); iconTween.kill(); arrowTween.kill(); buttons.forEach(button => { button.style.willChange = ""; }); };
  }, [active, activeIndex, compact, reduced, enabled]);

  useLayoutEffect(() => {
    if (variant !== "standalone" || !enabled || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo("[data-journey-intro]", { opacity: 0, y: 35 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.55, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top 80%", once: true }, clearProps: "transform,opacity" });
    }, root);
    return () => context.revert();
  }, [variant, enabled, reduced]);

  useLayoutEffect(() => {
    if (!compact || !enabled) return;
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [activeStep, compact, enabled]);

  const panelId = (id: JourneyStepId) => `${prefix}-${compact ? id : "shared"}-panel`;
  const panel = activeStep && <InteractiveDemoPanel stepId={activeStep} id={panelId(activeStep)} labelledBy={`${prefix}-${activeStep}`} pinned={Boolean(pinnedStep)} reduced={reduced} compact={compact}
    company={company} saved={savedCompanies.includes(company.id)} onSelect={value => { setCompany(value); focusPending.current = true; selectStep("map"); }} onSave={() => setSavedCompanies(current => current.includes(company.id) ? current.filter(id => id !== company.id) : [...current, company.id])}
    onNext={id => { focusPending.current = true; selectStep(id); }} onClose={() => close(true)} onPin={() => { cancelClose(); setPinnedStep(activeStep); }} onEnter={cancelClose} onLeave={scheduleClose} />;

  return <section ref={root} className={`${styles.journey} ${variant === "overlay" ? styles.overlay : styles.standalone}`} data-solution={variant === "overlay" ? "" : undefined} data-journey={variant} aria-label={journeyCopy.title}>
    <JourneyHeader />
    <div ref={setBoundary} className={styles.demoSlot}>
      {!active && <p className={styles.idleHint}><MousePointer2 size={15} aria-hidden="true" /> Pasa por una tarjeta para explorar. Haz clic para fijarla.</p>}
    </div>
    {!compact && active && <><ConnectionLine root={root} reference={elements.reference instanceof Element ? elements.reference : null} floating={elements.floating} active={active} reduced={reduced} x={x} y={y} />
      <div ref={setFloating} className={styles.floating} style={floatingStyles}>{panel}</div></>}
    <JourneyCards>
      {journeySteps.map(step => <li className={styles.cardItem} key={step.id} data-journey-intro style={{ "--accent": step.color } as CSSProperties} ref={node => { if (node) cards.current[step.id] = node; else delete cards.current[step.id]; }}>
        <JourneyCard step={step} active={activeStep === step.id} pinned={pinnedStep === step.id} tilt={enabled && !reduced && !compact} panelId={panelId(step.id)} triggerId={`${prefix}-${step.id}`}
          onPreview={() => { if (compact || !enabled) return; cancelClose(); setHoveredStep(step.id); }} onLeave={scheduleClose}
          onActivate={keyboard => { if (pinnedStep === step.id) close(false); else { focusPending.current = keyboard && !compact; selectStep(step.id); } }} />
        {compact && activeStep === step.id && <div className={styles.accordionBody}>{panel}</div>}
      </li>)}
    </JourneyCards>
  </section>;
}
