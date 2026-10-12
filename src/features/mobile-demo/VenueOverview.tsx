"use client";

import { mapPlans, expoStands } from "@/features/map/data/expoMapData";
import type { MapPlan } from "@/features/map/types";
import { STANDS } from "./catalog";
import s from "./mobile-demo.module.css";

const groups = [
  { id: "red", name: "Bloque Rojo", color: "#e78b79" },
  { id: "yellow", name: "Bloque Amarillo", color: "#edc436" },
  { id: "green", name: "Bloque Verde", color: "#76b86c" },
];
function Miniature({ plan }: { plan: MapPlan }) {
  return <svg viewBox={plan.viewBox} aria-hidden="true" className={s.miniature}>
    <path d={plan.outline} fill="var(--m-surface)" stroke={plan.color} strokeWidth="7" />
    {expoStands.filter((stand) => stand.planId === plan.id).map((stand) => <rect key={stand.id} x={stand.x} y={stand.y} width={stand.width} height={stand.height} fill={stand.fill} stroke={plan.color} strokeWidth="1.5" />)}
    <circle cx={plan.origin.x} cy={plan.origin.y} r="9" fill="#1677b8" stroke="white" strokeWidth="3" />
  </svg>;
}
export function VenueOverview({ onSelect }: { onSelect: (id: string) => void }) {
  return <div className={s.venue}>
    <div className={s.venueHeading}><h3>Vista general</h3><p>Elige un pabellón para ver sus planos</p></div>
    <div className={s.venueScene}>
      <svg viewBox="0 0 360 420" preserveAspectRatio="none" className={s.landscape} aria-hidden="true">
        <path d="M173 0C175 130 193 190 182 420M0 220Q110 191 180 215T360 205" stroke="var(--m-border)" strokeWidth="12" fill="none" />
        {[[22,174],[65,216],[305,214],[338,185],[20,360],[41,389],[318,361],[340,397]].map(([x,y],index) => <circle key={index} cx={x} cy={y} r={index%2?9:12} fill={index%2?"#4baa6b":"#78bd79"} />)}
      </svg>
      <div className={s.pavilions}>{groups.map((group) => {
        const floors = mapPlans.filter((plan) => plan.zoneId === group.id);
        return <button key={group.id} className={s.pavilion} style={{ borderBottomColor: group.color }} onClick={() => onSelect(floors[0].id)}>
          <Miniature plan={floors[0]} /><strong>{group.name}</strong><span>{floors.length} {floors.length === 1 ? "planta" : "plantas"} · {STANDS.filter((stand) => floors.some((floor) => floor.id === stand.planId)).length} stands demo</span>
        </button>;
      })}</div>
    </div>
    <div className={s.exteriors}>{mapPlans.filter((plan) => plan.level === "Exterior").map((plan) => <button key={plan.id} onClick={() => onSelect(plan.id)}><i style={{ background: plan.color }} />{plan.name}<span aria-hidden="true">→</span></button>)}</div>
    <p className={s.venueNote}>Esquema de zonas · toca un bloque para ver el plano</p>
  </div>;
}
