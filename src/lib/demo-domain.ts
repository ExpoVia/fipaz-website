
import { standsById } from "@/data/demo-data";
import type { Mission, Stand } from "@/types/demo";

// ─── Niveles ──────────────────────────────────────────────────────────────────

/**
 * Tabla de niveles para la demo v1.
 * Fuente única de verdad; no duplicar en componentes.
 *
 * | Puntos   | Nivel |
 * |----------|-------|
 * |   0–99   |   1   |
 * | 100–299  |   2   |
 * | 300–599  |   3   |
 * | 600+     |   4   |
 */
export function getLevelForPoints(points: number): number {
  if (points >= 600) return 4;
  if (points >= 300) return 3;
  if (points >= 100) return 2;
  return 1;
}

/** Umbral de puntos requerido para alcanzar cada nivel (índice = nivel - 1). */
export const LEVEL_THRESHOLDS = [0, 100, 300, 600] as const;

/** Nombre de explorador mostrado para cada nivel. Única fuente de verdad. */
export const LEVEL_LABELS: Record<number, string> = {
  1: "Explorador Novato",
  2: "Explorador",
  3: "Explorador Senior",
  4: "Explorador Élite",
};

/** Color de acento por nivel, reutilizado en el pasaporte y el perfil. */
export const LEVEL_COLORS: Record<number, string> = {
  1: "var(--expo-mint)",
  2: "var(--expo-blue)",
  3: "var(--expo-purple)",
  4: "var(--expo-yellow)",
};

// ─── Progreso de misiones ─────────────────────────────────────────────────────

export interface MissionProgress {
  /** Cantidad de stands de la misión ya visitados. */
  visited: number;
  /** Total de stands requeridos. */
  required: number;
  /** `true` si visited >= required. */
  completed: boolean;
}

/**
 * Calcula el progreso de una misión a partir de los stands visitados.
 * El resultado se deriva siempre; no se almacena un contador mutable.
 */
export function getMissionProgress(
  mission: Mission,
  visitedStandIds: readonly string[]
): MissionProgress {
  const visitedSet = new Set(visitedStandIds);
  const visited = mission.standIds.filter((id) => visitedSet.has(id)).length;
  return {
    visited,
    required: mission.requiredVisits,
    completed: visited >= mission.requiredVisits,
  };
}

// ─── Consultas de stand ───────────────────────────────────────────────────────

/** Devuelve el stand por ID o `undefined` si no existe. */
export function getStandById(standId: string): Stand | undefined {
  return standsById.get(standId);
}

/** Devuelve `true` si el stand ya fue visitado. */
export function isStandVisited(
  standId: string,
  visitedStandIds: readonly string[]
): boolean {
  return visitedStandIds.includes(standId);
}

/** Devuelve `true` si el stand está marcado como favorito. */
export function isStandFavorite(
  standId: string,
  favoriteStandIds: readonly string[]
): boolean {
  return favoriteStandIds.includes(standId);
}

// ─── Resolución del stand objetivo para el flujo NFC ─────────────────────────

import { stands } from "@/data/demo-data";

/**
 * Resuelve el stand que se "detectará" al iniciar el escaneo NFC.
 *
 * Orden de prioridad:
 * 1. `explicitStandId` — stand pasado desde una ficha.
 * 2. `selectedStandId` — stand actualmente seleccionado en el store.
 * 3. Primer stand no visitado de la lista.
 *
 * Devuelve `undefined` si no hay ningún stand válido disponible.
 */
export function resolveTargetStand(
  explicitStandId: string | undefined,
  selectedStandId: string | null,
  visitedStandIds: readonly string[]
): Stand | undefined {
  // 1. Explícito
  if (explicitStandId) {
    const stand = standsById.get(explicitStandId);
    if (stand) return stand;
  }

  // 2. Stand seleccionado en el store
  if (selectedStandId) {
    const stand = standsById.get(selectedStandId);
    if (stand) return stand;
  }

  // 3. Primer stand no visitado
  const visitedSet = new Set(visitedStandIds);
  return stands.find((s) => !visitedSet.has(s.id));
}
