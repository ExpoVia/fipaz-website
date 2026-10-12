"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ArrowRight, Check, Clock, Ellipsis, Flag, MapPin, Navigation, RotateCcw } from "lucide-react";
import type { DemoCompany, JourneyStepId } from "./journey-data";
import styles from "./RouteDemo.module.css";

type RouteDemoProps = { reduced: boolean; company: DemoCompany; onNext: (step: JourneyStepId) => void };

// Route in the map's own coordinates (viewBox 640x150). Every segment follows an isometric axis (slope 1/2).
const ROUTE = "M80 118L150 83L234 125L330 77L400 112L500 62L548 38";
const START = { x: 80, y: 118 };
const END = { x: 548, y: 38 };
const WAYPOINTS = [{ x: 234, y: 125 }, { x: 400, y: 112 }];
// Share of the route walked when the visitor passes the pavilion (corner at 330,77).
const PAVILION_AT = 0.53;

const TREES: ReadonlyArray<readonly [number, number, number]> = [
  [110, 50, 8], [125, 38, 6], [96, 90, 7], [36, 102, 7], [250, 70, 8], [263, 52, 7], [396, 38, 7], [405, 22, 6],
  [440, 126, 8], [190, 130, 8], [150, 134, 6], [560, 102, 8], [582, 114, 7], [20, 20, 6],
];
const PEOPLE: ReadonlyArray<readonly [number, number, string]> = [
  [120, 99, "#f27c68"], [192, 109, "#1687e8"], [276, 97, "#ffbd18"], [366, 88, "#8b4fc7"], [432, 97, "#f27c68"], [470, 70, "#1687e8"], [522, 52, "#82d6bf"],
];

type BoxProps = { cx: number; cy: number; hw: number; height: number; roof?: string; band?: string };

/** An isometric prism: (cx, cy) is the centre of its base diamond, hw its half width. */
function IsoBox({ cx, cy, hw, height, roof = "#5b93ee", band = "#b9d2f6" }: BoxProps) {
  const hh = hw / 2;
  const points = (list: number[][]) => list.map(([x, y]) => `${x},${y}`).join(" ");
  const leftFace = (u: number, z: number) => [cx - hw + hw * u, cy + hh * u - z];
  const rightFace = (u: number, z: number) => [cx + hw * u, cy + hh - hh * u - z];
  const strip = (face: (u: number, z: number) => number[], z1: number, z2: number) => points([face(0.12, z2), face(0.88, z2), face(0.88, z1), face(0.12, z1)]);
  const roofAt = (scale: number) => points([[cx - hw * scale, cy - height], [cx, cy + hh * scale - height], [cx + hw * scale, cy - height], [cx, cy - hh * scale - height]]);
  return <g>
    <polygon points={points([[cx - hw + 7, cy + 3], [cx + 7, cy + hh + 3], [cx + hw + 7, cy + 3], [cx + 7, cy - hh + 3]])} fill="#1d28591f" />
    <polygon points={points([[cx - hw, cy], [cx, cy + hh], [cx, cy + hh - height], [cx - hw, cy - height]])} fill="#f1f4fa" />
    <polygon points={points([[cx, cy + hh], [cx + hw, cy], [cx + hw, cy - height], [cx, cy + hh - height]])} fill="#d3dcee" />
    {[0.22, 0.52].map(level => <g key={level}>
      <polygon points={strip(leftFace, height * level, height * (level + 0.2))} fill={band} />
      <polygon points={strip(rightFace, height * level, height * (level + 0.2))} fill={band} opacity="0.75" />
    </g>)}
    <polygon points={roofAt(1)} fill={roof} />
    <polygon points={roofAt(0.7)} fill="#fff" opacity="0.28" />
  </g>;
}

function Tree({ x, y, r }: { x: number; y: number; r: number }) {
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cx="3" cy="2" rx={r} ry={r * 0.45} fill="#1d28591a" />
    <rect x="-1" y="-2" width="2" height="5" rx="1" fill="#8a6a4a" />
    <circle cx="0" cy={-r * 0.9} r={r} fill="#5fb870" />
    <circle cx={-r * 0.3} cy={-r * 1.15} r={r * 0.62} fill="#86d093" />
  </g>;
}

function Pin({ x, y, color }: { x: number; y: number; color: string }) {
  return <g transform={`translate(${x} ${y})`}><g data-pin>
    <path d="M0 0C-3 -6 -12 -14 -12 -22A12 12 0 1 1 12 -22C12 -14 3 -6 0 0Z" fill={color} stroke="#fff" strokeWidth="2" />
    <circle cx="0" cy="-22" r="5" fill="#fff" /><circle cx="0" cy="-22" r="2.2" fill={color} />
  </g></g>;
}

function Chip({ x, y, text }: { x: number; y: number; text: string }) {
  const width = text.length * 5.6 + 16;
  return <g className={styles.chip} data-pin>
    <rect x={x - width / 2} y={y - 8} width={width} height="16" rx="8" fill="#20234a" />
    <text x={x} y={y + 3.4} textAnchor="middle">{text}</text>
  </g>;
}

export function RouteDemo({ reduced, company, onNext }: RouteDemoProps) {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(reduced ? 2 : 0);
  const [run, setRun] = useState(0);
  const pavilion = `Pabellón ${company.stand[0]}`;

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      const element = root.current!;
      const path = element.querySelector<SVGPathElement>("[data-route]")!;
      const dot = element.querySelector<SVGCircleElement>("[data-route-dot]")!;
      const length = path.getTotalLength();
      const position = { progress: 0 };
      let lastPhase = -1;
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      element.style.setProperty("--route-progress", "0");
      gsap.fromTo("[data-stat]", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" });
      gsap.fromTo("[data-pin]", { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.12, delay: 0.1, ease: "back.out(2)" });
      gsap.fromTo("[data-ring]", { attr: { rx: 6, ry: 3 }, opacity: 0.55 }, { attr: { rx: 20, ry: 10 }, opacity: 0, duration: 1.5, repeat: -1, ease: "power1.out" });
      gsap.to(position, { progress: 1, duration: 2.6, delay: 0.3, ease: "none", onUpdate: () => {
        const point = path.getPointAtLength(length * position.progress);
        dot.setAttribute("transform", `translate(${point.x} ${point.y})`);
        path.style.strokeDashoffset = String(length * (1 - position.progress));
        element.style.setProperty("--route-progress", position.progress.toFixed(3));
        const nextPhase = position.progress >= 0.99 ? 2 : position.progress > PAVILION_AT ? 1 : 0;
        if (lastPhase !== nextPhase) { lastPhase = nextPhase; setPhase(nextPhase); }
      } });
    }, root);
    return () => context.revert();
  }, [reduced, run]);

  const messages = ["Avanza recto", "Gira a la derecha", `Llegaste al Stand ${company.stand}`];
  const arrived = phase === 2;
  const dotAt = reduced ? END : START;

  return <div ref={root} className={styles.root} style={reduced ? { "--route-progress": 1 } as CSSProperties : undefined}>
    <ul className={styles.stats}>
      <li className={styles.stat} data-stat><span className={styles.statIcon}><Navigation size={17} aria-hidden="true" /></span><span className={styles.statText}><strong>120 m</strong><small>de recorrido</small></span></li>
      <li className={styles.stat} data-stat><span className={styles.statIcon}><Clock size={17} aria-hidden="true" /></span><span className={styles.statText}><strong>2 min</strong><small>a pie</small></span></li>
      <li className={styles.stat} data-stat data-tone="destination"><span className={styles.statIcon}><Flag size={17} aria-hidden="true" /></span><span className={styles.statText}><strong>Stand {company.stand}</strong><small>Tu destino</small></span></li>
    </ul>

    <div className={styles.mapFrame}>
      <svg className={styles.map} viewBox="0 0 640 150" role="img" aria-label={`Mapa del recorrido hasta el stand ${company.stand}, pasando por el ${pavilion}`}>
        <IsoBox cx={190} cy={46} hw={34} height={26} />
        <IsoBox cx={330} cy={48} hw={48} height={22} roof="#3f78e0" />
        <IsoBox cx={48} cy={62} hw={28} height={20} roof="#7aa8f2" />
        <IsoBox cx={450} cy={60} hw={36} height={30} />
        <IsoBox cx={606} cy={72} hw={30} height={36} roof="#7aa8f2" />
        <IsoBox cx={520} cy={118} hw={26} height={14} roof="#9c8ae8" band="#d9d2f6" />
        <IsoBox cx={300} cy={128} hw={24} height={12} roof="#7aa8f2" />
        <path d={ROUTE} fill="none" stroke="#dbe5f0" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path d={ROUTE} fill="none" stroke="#fff" strokeWidth="21" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        {TREES.map(([x, y, r]) => <Tree key={`${x}-${y}`} x={x} y={y} r={r} />)}
        {PEOPLE.map(([x, y, color]) => <g key={`${x}-${y}`}><rect x={x - 1.6} y={y - 5} width="3.2" height="5" rx="1.4" fill={color} /><circle cx={x} cy={y - 6.6} r="1.8" fill="#4a3a35" /></g>)}
        <path d={ROUTE} fill="none" stroke="var(--accent)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.28" />
        <path data-route d={ROUTE} fill="none" stroke="var(--accent)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        {WAYPOINTS.map(point => <circle key={point.x} cx={point.x} cy={point.y} r="3.4" fill="#20234a" stroke="#fff" strokeWidth="1.6" />)}
        <ellipse data-ring cx={END.x} cy={END.y} rx="6" ry="3" fill="none" stroke="var(--accent)" strokeWidth="1.6" opacity="0.5" />
        <Pin x={START.x} y={START.y} color="#1687e8" />
        <Pin x={END.x} y={END.y} color="var(--accent)" />
        <circle data-route-dot cx="0" cy="0" r="5.5" transform={`translate(${dotAt.x} ${dotAt.y})`} fill="#20234a" stroke="#fff" strokeWidth="2" />
        <g className={styles.chips}>
          <Chip x={102} y={132} text="Tú estás aquí" />
          <Chip x={330} y={30} text={pavilion} />
          <Chip x={582} y={12} text={company.stand} />
        </g>
      </svg>
      <button type="button" className={styles.replay} onClick={() => { setPhase(reduced ? 2 : 0); setRun(run + 1); }} aria-label="Repetir recorrido"><RotateCcw size={14} /></button>
    </div>

    <ol className={styles.track} aria-label="Progreso del recorrido">
      <li className={styles.trackItem} data-reached="true" data-kind="start"><span className={styles.node}><MapPin size={15} aria-hidden="true" /></span><span>Tú estás aquí</span></li>
      <li className={styles.trackItem} data-reached={phase >= 1} data-kind="middle"><span className={styles.node}><Ellipsis size={16} aria-hidden="true" /></span><span>{pavilion}</span></li>
      <li className={styles.trackItem} data-reached={arrived} data-kind="end"><span className={styles.node}><Flag size={15} aria-hidden="true" /></span><span>{company.stand}</span></li>
    </ol>

    <div className={styles.footer}>
      <p className={styles.status} data-arrived={arrived} role="status">{arrived ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}{messages[phase]}</p>
      <button type="button" className={styles.primary} onClick={() => onNext("nfc")}>Probar check-in<ArrowRight size={16} aria-hidden="true" /></button>
    </div>
  </div>;
}
