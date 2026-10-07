"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowRight, MapPin, Minus, Plus } from "lucide-react";
import type { DemoCompany, JourneyStepId } from "./journey-data";
import styles from "./MapDemo.module.css";

type MapDemoProps = { reduced: boolean; company: DemoCompany; onNext: (step: JourneyStepId) => void };
type View = { x: number; y: number; w: number; h: number };
type Level = 0 | 1 | 2;

// Floor plan in its own units. Three pavilions of 8x3 stands (4 | aisle | 4) over a main corridor, two zones and the entrance.
const W = 720;
const H = 240;
const ENTRANCE = { x: 360, y: 206 };
const PAV_Y = 8;
const PAV_H = 100;
const CORRIDOR_Y = 126;
const COLS = 8;
const ROWS = 3;
const AISLE = 12;
const ROW_Y0 = 34;
const ROW_STEP = 23;
const STAND_H = 19;

type Pavilion = { letter: string; x: number; w: number; tint: string; edge: string; stands: string[] };
const PAVILIONS: Pavilion[] = [
  { letter: "A", x: 12, w: 224, tint: "#e6effc", edge: "#b9d0f4", stands: ["#cfe0fb", "#bcd4f8", "#dbe8fc"] },
  { letter: "B", x: 272, w: 176, tint: "#efe8f9", edge: "#cfbfea", stands: ["#e0d3f4", "#d3c2ee", "#e9defa"] },
  { letter: "C", x: 484, w: 224, tint: "#fbe9f2", edge: "#f0c2d8", stands: ["#f7d3e5", "#f1c1da", "#fbe0ee"] },
];

type Stand = { id: number; letter: string; x: number; y: number; w: number; row: number; col: number; fill: string };

function pavilionLayout(pavilion: Pavilion) {
  const w = pavilion.letter === "B" ? 15 : 20;
  const gap = pavilion.letter === "B" ? 3 : 3.5;
  const total = COLS * w + (COLS - 2) * gap + AISLE;
  const start = pavilion.x + (pavilion.w - total) / 2;
  return { w, colX: (col: number) => start + col * (w + gap) + (col >= COLS / 2 ? AISLE - gap : 0), aisleX: pavilion.x + pavilion.w / 2 };
}

const STANDS: Stand[] = PAVILIONS.flatMap(pavilion => {
  const { w, colX } = pavilionLayout(pavilion);
  return Array.from({ length: ROWS * COLS }, (_, index) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    return { id: index + 1, letter: pavilion.letter, x: colX(col), y: ROW_Y0 + row * ROW_STEP, w, row, col, fill: pavilion.stands[(index * 5 + row) % 3] };
  });
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Zoom levels: the whole venue, the destination pavilion, the destination stand with its neighbours.
function viewFor(level: Level, destination: Stand, pavilion: Pavilion): View {
  if (level === 0) return { x: 0, y: 0, w: W, h: H };
  if (level === 1) {
    const w = 330, h = 110;
    return { x: clamp(pavilion.x + pavilion.w / 2 - w / 2, 0, W - w), y: clamp(PAV_Y + PAV_H / 2 - h / 2, 0, H - h), w, h };
  }
  const w = 200, h = 68;
  return { x: clamp(destination.x + destination.w / 2 - w / 2, 0, W - w), y: clamp(destination.y + STAND_H / 2 - h / 2, 0, H - h), w, h };
}

const viewBox = (view: View) => `${view.x} ${view.y} ${view.w} ${view.h}`;
const fixedTransform = (x: number, y: number, view: View) => `translate(${x} ${y}) scale(${view.w / W})`;

/** Writes the camera to the DOM. Pins, chips and the route stroke keep their on-screen size whatever the zoom. */
function applyView(svg: SVGSVGElement, route: SVGPathElement | null, view: View) {
  svg.setAttribute("viewBox", viewBox(view));
  svg.querySelectorAll<SVGGElement>("[data-fixed]").forEach(group => group.setAttribute("transform", fixedTransform(Number(group.dataset.x), Number(group.dataset.y), view)));
  if (route) route.style.strokeWidth = String(3.2 * (view.w / W));
}

const levelLabel = (level: Level, company: DemoCompany) => level === 0 ? "Vista general" : level === 1 ? `Pabellón ${company.stand[0]}` : `Stand ${company.stand}`;

function Chip({ text }: { text: string }) {
  const width = text.length * 5.8 + 14;
  return <g className={styles.chip}><rect x="15" y="-33" width={width} height="16" rx="8" fill="#20234a" /><text x={15 + width / 2} y="-22" textAnchor="middle">{text}</text></g>;
}

function Scene({ reduced, company, onNext }: MapDemoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const [level, setLevel] = useState<Level>(reduced ? 1 : 0);

  const [letter, number] = company.stand.split("-");
  const destination = STANDS.find(stand => stand.letter === letter && stand.id === Number(number)) ?? STANDS[0];
  const pavilion = PAVILIONS.find(item => item.letter === destination.letter) ?? PAVILIONS[0];
  const { aisleX } = pavilionLayout(pavilion);
  const destinationCy = destination.y + STAND_H / 2;
  const edgeX = destination.col < COLS / 2 ? destination.x + destination.w : destination.x;
  const route = `M${ENTRANCE.x} ${ENTRANCE.y}V${CORRIDOR_Y}H${aisleX}V${destinationCy}H${edgeX}`;

  // The first render fixes the initial camera; later changes go straight to the DOM so React never overwrites them.
  const [initial] = useState(() => viewFor(reduced ? 1 : 0, destination, pavilion));
  const view = useRef<View>({ ...initial });

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      const path = routeRef.current!;
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      gsap.set("[data-stand]", { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
      gsap.set(["[data-stand-label]", "[data-dest-pin]"], { opacity: 0 });
      gsap.timeline({ delay: 0.2 })
        .fromTo("[data-entrance]", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, 0)
        .to(path, { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut" }, 0.1)
        .call(() => setLevel(1), [], 1.1)
        .to("[data-stand]", { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.6)", stagger: { amount: 0.9, from: STANDS.indexOf(destination), grid: "auto" } }, 1.3)
        .to("[data-stand-label]", { opacity: 1, duration: 0.4 }, 2.1)
        .fromTo("[data-dest-pin]", { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 2.15)
        .fromTo("[data-ring]", { attr: { r: 7 }, opacity: 0.6 }, { attr: { r: 24 }, opacity: 0, duration: 1.5, repeat: -1, ease: "power1.out" }, 2.3);
    }, svgRef);
    return () => context.revert();
  }, [reduced, destination]);

  useLayoutEffect(() => {
    const svg = svgRef.current!;
    const target = viewFor(level, destination, pavilion);
    if (reduced) { Object.assign(view.current, target); applyView(svg, routeRef.current, view.current); return; }
    const tween = gsap.to(view.current, { ...target, duration: 1.1, ease: "power3.inOut", onUpdate: () => applyView(svg, routeRef.current, view.current) });
    return () => { tween.kill(); };
  }, [level, reduced, destination, pavilion]);

  const zoom = (delta: number) => setLevel(current => clamp(current + delta, 0, 2) as Level);

  return <div className={styles.root}>
    <div className={styles.frame}>
      <svg ref={svgRef} className={styles.map} viewBox={viewBox(initial)} preserveAspectRatio="xMidYMid meet" role="img"
        aria-label={`Plano de demostración del recinto: pabellones A, B y C con sus stands. Tu destino es el stand ${company.stand}.`}>
        <rect x="0" y="0" width={W} height={H} rx="14" fill="#f4f7fb" stroke="#dde5f0" />
        <path d={`M0 ${CORRIDOR_Y}H${W}M254 0V${H}M466 0V${H}`} stroke="#fff" strokeWidth="28" fill="none" />
        <path d={`M0 ${CORRIDOR_Y}H${W}M254 0V${H}M466 0V${H}`} stroke="#e2e9f3" strokeWidth="1" strokeDasharray="5 6" fill="none" />

        {PAVILIONS.map(item => {
          const { aisleX: aisle } = pavilionLayout(item);
          return <g key={item.letter}>
            <rect x={item.x} y={PAV_Y} width={item.w} height={PAV_H} rx="10" fill={item.tint} stroke={item.edge} />
            <text className={styles.pavilionLabel} x={item.x + 12} y={PAV_Y + 15}>PABELLÓN {item.letter}</text>
            <rect x={aisle - 7} y={PAV_Y + PAV_H - 6} width="14" height="12" fill="#fff" />
          </g>;
        })}

        <g>
          <rect x="12" y="148" width="224" height="84" rx="10" fill="#fff4d8" stroke="#f1dca2" />
          <text className={styles.pavilionLabel} x="24" y="164">ZONA GAMING</text>
          {Array.from({ length: 16 }, (_, index) => <rect key={index} x={26 + (index % 8) * 26} y={176 + Math.floor(index / 8) * 26} width="20" height="18" rx="3" fill="#ffe7a6" />)}
          <rect x="484" y="148" width="224" height="84" rx="10" fill="#e1f4ed" stroke="#b9e2d3" />
          <text className={styles.pavilionLabel} x="496" y="164">STARTUPS</text>
          {Array.from({ length: 16 }, (_, index) => <rect key={index} x={498 + (index % 8) * 26} y={176 + Math.floor(index / 8) * 26} width="20" height="18" rx="3" fill="#c7ebdd" />)}
          <rect x="284" y="152" width="152" height="76" rx="10" fill="#fff" stroke="#e1e8f1" />
          <text className={styles.pavilionLabel} x="360" y="220" textAnchor="middle">ENTRADA</text>
        </g>

        {STANDS.map(stand => {
          const isDestination = stand === destination;
          return <g key={`${stand.letter}${stand.id}`} data-stand>
            <rect x={stand.x} y={stand.y} width={stand.w} height={STAND_H} rx="3" fill={isDestination ? "var(--accent)" : stand.fill} stroke={isDestination ? "#fff" : "#ffffffb3"} strokeWidth={isDestination ? 1.4 : 0.8} />
            <text className={isDestination ? styles.standNumberActive : styles.standNumber} data-stand-label x={stand.x + stand.w / 2} y={stand.y + STAND_H / 2 + 2.8} textAnchor="middle">{String(stand.id).padStart(2, "0")}</text>
          </g>;
        })}

        <path ref={routeRef} d={route} fill="none" stroke="var(--accent)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />

        <g data-fixed data-x={ENTRANCE.x} data-y={ENTRANCE.y} transform={fixedTransform(ENTRANCE.x, ENTRANCE.y, initial)}>
          <g data-entrance><circle r="7" fill="#20234a" stroke="#fff" strokeWidth="2.4" /><circle r="2.4" fill="#fff" /></g>
        </g>
        <g data-fixed data-x={destination.x + destination.w / 2} data-y={destinationCy} transform={fixedTransform(destination.x + destination.w / 2, destinationCy, initial)}>
          <circle data-ring r="7" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.6" />
        </g>
        <g data-fixed data-x={destination.x + destination.w / 2} data-y={destination.y} transform={fixedTransform(destination.x + destination.w / 2, destination.y, initial)}>
          <g data-dest-pin>
            <path d="M0 0C-3 -6 -12 -14 -12 -22A12 12 0 1 1 12 -22C12 -14 3 -6 0 0Z" fill="var(--accent)" stroke="#fff" strokeWidth="2" />
            <circle cx="0" cy="-22" r="5" fill="#fff" /><circle cx="0" cy="-22" r="2.2" fill="var(--accent)" />
            <Chip text={company.stand} />
          </g>
        </g>
      </svg>

      <span className={styles.focus} aria-live="polite">{levelLabel(level, company)}</span>
      <div className={styles.zoom} role="group" aria-label="Zoom del mapa">
        <button type="button" className={styles.zoomButton} onClick={() => zoom(1)} disabled={level === 2} aria-label="Acercar mapa"><Plus size={15} aria-hidden="true" /></button>
        <button type="button" className={styles.zoomButton} onClick={() => zoom(-1)} disabled={level === 0} aria-label="Alejar mapa"><Minus size={15} aria-hidden="true" /></button>
      </div>
    </div>

    <div className={styles.footer}>
      <div className={styles.legend}><span><i /> Tú estás aquí</span><strong><MapPin size={13} aria-hidden="true" /> Stand {company.stand} · {company.name}</strong></div>
      <button type="button" className={styles.primary} onClick={() => onNext("route")}>Cómo llegar<ArrowRight size={16} aria-hidden="true" /></button>
    </div>
  </div>;
}

// Remounts when the company changes so the camera and the intro start over.
export function MapDemo(props: MapDemoProps) {
  return <Scene key={props.company.id} {...props} />;
}
