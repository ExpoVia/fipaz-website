import { Cross, DoorOpen, Info, Landmark, LogOut, Music, Utensils } from "lucide-react";
import type { CategoryMeta, Poi, PoiMeta, RouteDefinition, Zone } from "../types";
import { mapPlans, planStands } from "./fipaz2026Plans";

export { mapPlans };
export const expoStands = planStands;
export const categoryMeta: CategoryMeta[] = [
  { id: "technology", label: "Tecnologia (demo)", pattern: "TEC" },
  { id: "health", label: "Salud (demo)", pattern: "SAL" },
  { id: "food", label: "Gastronomia (demo)", pattern: "GAS" },
  { id: "gastronomy", label: "Gastronomia artesanal (demo)", pattern: "ART" },
  { id: "finance", label: "Finanzas (demo)", pattern: "FIN" },
  { id: "unassigned", label: "Sin rubro confirmado", pattern: "S/R" },
];


export const zones: Zone[] = [
  { id: "red", name: "Bloque Rojo", shortName: "Internacional I / II", category: "unassigned", color: "#f9ddda", borderColor: "#bd3636", labelX: 167, labelY: 173, path: "M45 135H290V460H45Z", description: "Internacional I en planta baja e Internacional II en planta alta." },
  { id: "yellow", name: "Bloque Amarillo", shortName: "La Paz / Bolivia", category: "unassigned", color: "#f5eab0", borderColor: "#a2850e", labelX: 603, labelY: 173, path: "M455 135H750V460H455Z", description: "Pabellon La Paz en planta baja y Pabellon Bolivia en planta alta." },
  { id: "green", name: "Bloque Verde", shortName: "Americano", category: "unassigned", color: "#cfebdd", borderColor: "#23875b", labelX: 1048, labelY: 173, path: "M920 150L1175 178V460H920Z", description: "Pabellon Americano en planta alta. No se proporciono plano de planta baja." },
];

export const poiMeta: PoiMeta[] = [
  { id: "entrance", label: "Entradas", icon: DoorOpen }, { id: "exit", label: "Salidas", icon: LogOut },
  { id: "toilet", label: "Banos", icon: Landmark }, { id: "food", label: "Comida", icon: Utensils },
  { id: "stage", label: "Escenario", icon: Music }, { id: "info", label: "Informacion (demo)", icon: Info },
  { id: "health", label: "Primeros auxilios (demo)", icon: Cross },
];

export const pois: Poi[] = [
  ...mapPlans.map((plan): Poi => ({ id: `${plan.id}-access`, planId: plan.id, type: "entrance", label: "Acceso", ...plan.origin })),
  ...mapPlans.flatMap((plan) => plan.structures.filter((item) => item.label === "Banos").map((item, i): Poi => ({ id: `${plan.id}-toilet-${i}`, planId: plan.id, type: "toilet", label: "Banos", x: item.x!, y: item.y! + 24 }))),
  { id: "main-stage", planId: "entrance", type: "stage", label: "Escenario principal", x: 305, y: 287 },
  { id: "info-main", planId: "entrance", type: "info", label: "Informacion (ubicacion demo)", x: 278, y: 611 },
  { id: "health-aid", planId: "entrance", type: "health", label: "Primeros auxilios (ubicacion demo)", x: 360, y: 611 },
  { id: "exit-entrance", planId: "entrance", type: "exit", label: "Salida", x: 348, y: 677 },
  { id: "food-tables", planId: "food-court", type: "food", label: "Patio de comidas", x: 320, y: 451 },
  { id: "exit-green", planId: "green-upper", type: "exit", label: "Salida", x: 62, y: 639 },
];

// Each of the four predefined routes starts at its plan's simulated access point.
export const routeDefinitions: RouteDefinition[] = [
  { standId: "red-lower-12", planId: "red-lower", points: "625,460 625,416 71,416 71,399", instruction: "Desde el acceso, gira a la izquierda por el pasillo transversal hasta el espacio 12." },
  { standId: "yellow-lower-4", planId: "yellow-lower", points: "188,490 188,471 210,471", instruction: "Desde el acceso, sigue junto a la primera isla hasta el espacio 4." },
  { standId: "green-upper-5", planId: "green-upper", points: "199,511 205,511 205,325 183,325", instruction: "Desde el acceso, sigue el pasillo izquierdo hasta el espacio 5." },
  { standId: "entrance-1", planId: "entrance", points: "321,638 321,601 312,601 312,584", instruction: "Desde el ingreso principal, avanza hasta el espacio del anfitrion." },
];
export const userLocation = { planId: "entrance", x: 321, y: 638 };
