"use client";

import { Check, DoorOpen, Utensils } from "lucide-react";
import { useId, type KeyboardEvent } from "react";
import { mapPlans, poiMeta, pois, zones } from "../data/expoMapData";
import type { MapPlan, PoiType, RouteDefinition, Stand, StandCategory } from "../types";
import styles from "./map.module.css";

interface ExpoMapSvgProps {
  compact: boolean;
  idPrefix: string;
  plan: MapPlan | null;
  stands: Stand[];
  selectedStandId: string | null;
  visitedStandIds: string[];
  activeCategories: StandCategory[];
  activePoiTypes: PoiType[];
  zoomLevel: "general" | "zone" | "stand";
  activeRoute: RouteDefinition | null;
  reducedMotion: boolean;
  onPlanPress: (planId: string) => void;
  onStandPress: (standId: string) => void;
}

function activate(event: KeyboardEvent<SVGGElement>, action: () => void) {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
}

function Overview({ onPlanPress }: Pick<ExpoMapSvgProps, "onPlanPress">) {
  return <>
    <path d="M30 480H1190V536H30Z" fill="#e7ebea" />
    <text x="608" y="515" textAnchor="middle" fontSize="19" fill="#596460">Recinto sujeto a confirmación</text>
    {zones.map((zone) => <g key={zone.id}>
      <path d={zone.path} fill={zone.color} stroke={zone.borderColor} strokeWidth="3" />
      <text x={zone.labelX} y={zone.labelY + (zone.id === "green" ? 35 : 0)} textAnchor="middle" fontWeight="700" fontSize="23">{zone.name}</text>
      {mapPlans.filter((plan) => plan.zoneId === zone.id).map((plan, index) => <g key={plan.id} role="button" tabIndex={0} aria-label={`${plan.name}, ${plan.level}`} className={styles.mapTarget} onClick={() => onPlanPress(plan.id)} onKeyDown={(event) => activate(event, () => onPlanPress(plan.id))}>
        <rect x={zone.labelX - 105} y={235 + index * 99} width="210" height="80" rx="4" fill="white" stroke={zone.borderColor} />
        <text x={zone.labelX} y={265 + index * 99} textAnchor="middle" fontSize="18" fontWeight="700">{plan.name}</text>
        <text x={zone.labelX} y={292 + index * 99} textAnchor="middle" fontSize="16" fill="#596460">{plan.level}</text>
      </g>)}
    </g>)}
    <g role="button" tabIndex={0} className={styles.mapTarget} aria-label="Plaza Akapana, ingreso principal" onClick={() => onPlanPress("entrance")} onKeyDown={(event) => activate(event, () => onPlanPress("entrance"))}>
      <path d="M303 211H442V460H303Z" fill="#e0ebef" stroke="#7894a0" strokeWidth="2" />
      <DoorOpen x="354" y="251" size={36} color="#3c606f" />
      <text x="372" y="323" textAnchor="middle" fontWeight="700" fontSize="19">Plaza</text><text x="372" y="348" textAnchor="middle" fontWeight="700" fontSize="19">Akapana</text>
      <text x="372" y="407" textAnchor="middle" fontSize="15">Ingreso principal</text>
      <path d="M372 580V455" stroke="#3384b0" strokeWidth="5" strokeDasharray="9 6" />
    </g>
    <g role="button" tabIndex={0} className={styles.mapTarget} aria-label="Patio de comidas, entre Amarillo y Verde" onClick={() => onPlanPress("food-court")} onKeyDown={(event) => activate(event, () => onPlanPress("food-court"))}>
      <path d="M763 211H907V460H763Z" fill="#edf0cf" stroke="#9aab57" strokeWidth="2" />
      <Utensils x="817" y="251" size={36} color="#687632" />
      <text x="835" y="323" textAnchor="middle" fontWeight="700" fontSize="19">Patio de</text><text x="835" y="348" textAnchor="middle" fontWeight="700" fontSize="19">comidas</text>
      <text x="835" y="407" textAnchor="middle" fontSize="15">G-1 a G-29</text>
    </g>
  </>;
}

function CompactOverview({ onPlanPress }: Pick<ExpoMapSvgProps, "onPlanPress">) {
  return <>
    <path d="M190 65H230V581H190Z" fill="#e0e7e1" />
    {zones.map((zone, index) => {
      const y = [28, 254, 480][index];
      return <g key={zone.id}>
        <path d={`M25 ${y}H395V${y + (index === 2 ? 124 : 146)}H25Z`} fill={zone.color} stroke={zone.borderColor} strokeWidth="2" />
        <text x="42" y={y + 29} fontSize="20" fontWeight="700">{zone.name}</text>
        {mapPlans.filter((plan) => plan.zoneId === zone.id).map((plan, i) => <g key={plan.id} className={styles.mapTarget} role="button" tabIndex={0} aria-label={`${plan.name}, ${plan.level}`} onClick={() => onPlanPress(plan.id)} onKeyDown={(event) => activate(event, () => onPlanPress(plan.id))}>
          <rect x={41 + i * 174} y={y + 48} width={index === 2 ? 338 : 164} height="70" rx="3" fill="white" stroke={zone.borderColor} />
          <text x={index === 2 ? 210 : 123 + i * 174} y={y + 76} textAnchor="middle" fontSize="16" fontWeight="700">{plan.name}</text>
          <text x={index === 2 ? 210 : 123 + i * 174} y={y + 101} textAnchor="middle" fontSize="13" fill="#596460">{plan.level}</text>
        </g>)}
      </g>;
    })}
    {[{ id: "entrance", name: "Plaza Akapana", detail: "Ingreso principal", y: 184, color: "#e0ebef", Icon: DoorOpen }, { id: "food-court", name: "Patio de comidas", detail: "G-1 a G-29", y: 410, color: "#edf0cf", Icon: Utensils }].map(({ id, name, detail, y, color, Icon }) => <g key={id} className={styles.mapTarget} role="button" tabIndex={0} aria-label={`${name}, ${detail}`} onClick={() => onPlanPress(id)} onKeyDown={(event) => activate(event, () => onPlanPress(id))}>
      <rect x="75" y={y} width="270" height="60" fill={color} stroke="#8fa195" />
      <Icon x="91" y={y + 17} size={25} color="#496251" />
      <text x="134" y={y + 25} fontSize="17" fontWeight="700">{name}</text><text x="134" y={y + 45} fontSize="12" fill="#53665a">{detail}</text>
    </g>)}
  </>;
}

export function ExpoMapSvg({ compact, idPrefix, plan, stands, selectedStandId, visitedStandIds, activeCategories, activePoiTypes, zoomLevel, activeRoute, reducedMotion, onPlanPress, onStandPress }: ExpoMapSvgProps) {
  const instance = useId().replaceAll(":", "");
  const showCodes = zoomLevel !== "general";
  return <svg aria-label={plan ? `${plan.name}, ${plan.level}. Mapa demostrativo FIPAZ 2026` : "Recinto FIPAZ 2026, mapa demostrativo"} className={styles.svg} role="group" viewBox={plan?.viewBox ?? (compact ? "0 0 420 632" : "0 80 1220 540")}>
    <defs><pattern id={`${instance}-stairs`} width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0H8" stroke="#cbd2cf" strokeWidth="1" /></pattern></defs>
    {!plan ? compact ? <CompactOverview onPlanPress={onPlanPress} /> : <Overview onPlanPress={onPlanPress} /> : <>
      <path id={`${idPrefix}-floor-outline`} d={plan.outline} fill="white" stroke="#646f69" strokeWidth="2" />
      {plan.structures.map((item, i) => <g key={i}>
        <path d={item.path} fill={item.label?.includes("ascensor") || item.label === "Rampas" || item.label === "Ascensor" ? `url(#${instance}-stairs)` : "#f0f3f1"} stroke="#b4bdb8" strokeWidth="1" />
        <text x={item.x} y={item.y} textAnchor="middle" fill="#53615b" fontSize={plan.id === "entrance" ? 8 : 10}>{item.label}</text>
      </g>)}
      {plan.id === "entrance" && <text x="310" y="411" textAnchor="middle" fontWeight="700" fontSize="17" fill="#53615b">PLAZA AKAPANA</text>}
      {plan.id === "food-court" && <g fill="white" stroke="#b1bab3" strokeWidth="1">
        {[275, 320, 365, 410, 455, 500, 615].flatMap((y, row) => [120, 175, 265, 390].map((x, col) => {
          if ((row < 2 && col < 2) || (row === 6 && col < 2)) return null;
          return <g key={`${x}-${y}`}><circle cx={x} cy={y} r="6" /><path d={`M${x - 3} ${y - 10}h6M${x - 3} ${y + 10}h6M${x - 10} ${y - 3}v6M${x + 10} ${y - 3}v6`} /></g>;
        }))}
      </g>}
      {stands.filter((stand) => stand.planId === plan.id).map((stand) => {
        const visible = activeCategories.includes(stand.category);
        const selected = selectedStandId === stand.id;
        const visited = visitedStandIds.includes(stand.id);
        const fontSize = Math.min(14, stand.width / (stand.code.length * 0.75 + 1));
        return <g key={stand.id} id={`${idPrefix}-stand-${stand.id}`} className={visible ? styles.mapTarget : undefined} role={visible ? "button" : undefined} tabIndex={visible ? 0 : undefined} aria-label={visible ? `Espacio ${stand.code}, ${stand.name}${visited ? ", visitado" : ""}` : undefined} aria-hidden={!visible} onClick={visible ? () => onStandPress(stand.id) : undefined} onKeyDown={visible ? (event) => activate(event, () => onStandPress(stand.id)) : undefined}>
          <rect x={stand.x + 0.8} y={stand.y + 0.8} width={stand.width - 1.6} height={stand.height - 1.6} fill={visible ? selected ? "#cbeaff" : stand.fill ?? "#e7ece8" : "#f3f5f3"} stroke={selected ? "#076baf" : visited ? "#218051" : visible ? "#67746d" : "#dee3df"} strokeWidth={selected ? 3 : 1} strokeDasharray={visited && !selected ? "4 2" : undefined} />
          {visible && (showCodes || selected) && <text x={stand.x + stand.width / 2} y={stand.y + stand.height / 2} dominantBaseline="central" textAnchor="middle" fontSize={fontSize} fontWeight="700">{stand.code}</text>}
          {visible && zoomLevel === "stand" && stand.demo && stand.width > 60 && stand.height > 60 && <text x={stand.x + stand.width / 2} y={stand.y + stand.height / 2 + 19} textAnchor="middle" fontSize="9" fill="#51635b">{stand.logoText} · demo</text>}
          {visible && visited && <Check x={stand.x + stand.width - 12} y={stand.y + 2} size={10} color="#16653e" strokeWidth={3} />}
        </g>;
      })}
      {pois.filter((poi) => poi.planId === plan.id && activePoiTypes.includes(poi.type) && (showCodes || poi.type === "entrance")).map((poi) => {
        const Icon = poiMeta.find((meta) => meta.id === poi.type)!.icon;
        return <g key={poi.id} aria-label={poi.label} role="img"><title>{poi.label}</title><rect x={poi.x - 8} y={poi.y - 8} width="16" height="16" rx="3" fill="#315c71" /><Icon x={poi.x - 6} y={poi.y - 6} size={12} color="white" /></g>;
      })}
      {activeRoute?.planId === plan.id && <g id={`${idPrefix}-route`} aria-label="Ruta aproximada de demostracion">
        <polyline points={activeRoute.points} stroke="white" fill="none" strokeWidth="7" strokeLinejoin="round" />
        <polyline className={reducedMotion ? undefined : styles.route} points={activeRoute.points} pathLength="1" stroke="#057cbd" fill="none" strokeWidth="4" strokeLinejoin="round" />
      </g>}
      <g id={`${idPrefix}-you-are-here`} aria-label="Ubicacion simulada en el acceso de este plano"><circle cx={plan.origin.x} cy={plan.origin.y} r="11" fill="#1196dc" fillOpacity="0.18" /><circle cx={plan.origin.x} cy={plan.origin.y} r="5" fill="#087db5" stroke="white" strokeWidth="2" /></g>
    </>}
  </svg>;
}
