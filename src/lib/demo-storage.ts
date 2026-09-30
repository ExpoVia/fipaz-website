
import { z } from "zod";
import { stands, zones } from "@/data/demo-data";
import { MISSIONS } from "@/data/missions";
import { DEMO_FIXTURE } from "@/data/demo-fixture";
import { getLevelForPoints } from "@/lib/demo-domain";
import type { PersistedDemoStateV1 } from "@/types/demo";

// ─── Constantes ───────────────────────────────────────────────────────────────

export const STORAGE_KEY = "expovia-demo:v1";
export const VISIT_POINTS = DEMO_FIXTURE.points.perNewVisit;
export const INITIAL_POINTS = VISIT_POINTS * 2;

// ─── Estado inicial canónico ──────────────────────────────────────────────────

/** IDs del estado inicial. Separados para que sean reutilizables en tests. */
export const INITIAL_VISITED_IDS = [
  "stand-altura-labs",
  "stand-kawsay-salud",
] as const;

/**
 * Estado persistido inicial.
 * Las fechas son ISO 8601 fijas para evitar diferencias de hidratación.
 */
export const initialPersistedState: PersistedDemoStateV1 = {
  points: INITIAL_POINTS,
  level: 2,
  selectedStandId: null,
  selectedZoneId: "zone-yellow",
  visitedStandIds: ["stand-altura-labs", "stand-kawsay-salud"],
  favoriteStandIds: [],
  recentVisits: [
    {
      id: "visit-stand-kawsay-salud-initial",
      standId: "stand-kawsay-salud",
      visitedAt: "2026-09-08T08:30:00-04:00",
      pointsAwarded: 50,
    },
    {
      id: "visit-stand-altura-labs-initial",
      standId: "stand-altura-labs",
      visitedAt: "2026-09-08T08:00:00-04:00",
      pointsAwarded: 50,
    },
  ],
  lastKnownLocation: {
    zoneId: "zone-blue",
    x: 12,
    y: 82,
    label: "Entrada principal",
  },
  // Progreso coherente con las dos visitas simuladas del estado inicial.
  missionProgress: {
    "primer-contacto": 1,
    "ruta-tecnologica": 1,
    "explorador-expovia": 2,
  },
  specialActionsDone: [],
  unlockedMissionIds: ["maestro-mapa"],
  redeemedRewardIds: [],
};

// ─── Esquema Zod ──────────────────────────────────────────────────────────────

const validCatalogStandIds = stands.map((stand) => stand.id);
const validMissionStandIds = MISSIONS.flatMap(
  (mission) => mission.standIds ?? [],
);
const validStandIds = [
  ...new Set([...validCatalogStandIds, ...validMissionStandIds]),
];
const validZoneIds = zones.map((zone) => zone.id);

const visitSchema = z.object({
  id: z.string().min(1),
  standId: z.string().min(1),
  standName: z.string().min(1).optional(),
  visitedAt: z.string().datetime({ offset: true }),
  pointsAwarded: z.literal(VISIT_POINTS),
});

const locationSchema = z.object({
  zoneId: z.string().min(1),
  x: z.number().finite(),
  y: z.number().finite(),
  label: z.string().min(1),
});

const persistedStateSchema = z.object({
  points: z.number().int().nonnegative(),
  level: z.number().int().min(1).max(4),
  selectedStandId: z.string().nullable(),
  selectedZoneId: z.string().nullable(),
  visitedStandIds: z.array(z.string().min(1)).max(200),
  favoriteStandIds: z.array(z.string().min(1)).max(200),
  recentVisits: z.array(visitSchema).max(10),
  lastKnownLocation: locationSchema,
  // Los defaults permiten hidratar estados guardados antes de integrar
  // misiones y recompensas con el store principal.
  missionProgress: z.record(z.string(), z.number().int().nonnegative()).default({}),
  specialActionsDone: z.array(z.string().min(1)).default([]),
  unlockedMissionIds: z.array(z.string().min(1)).default([]),
  redeemedRewardIds: z.array(z.string().min(1)).default([]),
});

// ─── Normalización post-validación ────────────────────────────────────────────

/**
 * Normaliza el estado validado:
 * - Elimina IDs de stands que ya no existen en el catálogo.
 * - Elimina duplicados.
 * - Recalcula el nivel desde puntos.
 * - Limita historial a 10.
 */
function normalizePersistedState(
  raw: z.infer<typeof persistedStateSchema>
): PersistedDemoStateV1 {
  const validIds = new Set(validStandIds);
  const validCatalogIds = new Set(validCatalogStandIds);
  const validZones = new Set(validZoneIds);

  const visitedStandIds = [
    ...new Set(raw.visitedStandIds.filter((id) => validIds.has(id))),
  ];

  const favoriteStandIds = [
    ...new Set(raw.favoriteStandIds.filter((id) => validIds.has(id))),
  ];

  const seenVisitIds = new Set<string>();
  const seenVisitedStands = new Set<string>();
  const recentVisits = raw.recentVisits.filter((visit) => {
    if (
      !validIds.has(visit.standId) ||
      seenVisitIds.has(visit.id) ||
      seenVisitedStands.has(visit.standId)
    ) {
      return false;
    }

    seenVisitIds.add(visit.id);
    seenVisitedStands.add(visit.standId);
    return true;
  });

  const level = getLevelForPoints(raw.points);

  const selectedStandId =
    raw.selectedStandId && validCatalogIds.has(raw.selectedStandId)
      ? raw.selectedStandId
      : null;

  const selectedZoneId =
    raw.selectedZoneId && validZones.has(raw.selectedZoneId)
      ? raw.selectedZoneId
      : null;

  const lastKnownLocation = validZones.has(raw.lastKnownLocation.zoneId)
    ? raw.lastKnownLocation
    : initialPersistedState.lastKnownLocation;

  return {
    ...raw,
    visitedStandIds,
    favoriteStandIds,
    recentVisits,
    level,
    selectedStandId,
    selectedZoneId,
    lastKnownLocation,
  };
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Lee y valida el estado desde localStorage.
 * Si los datos son inválidos, corruptos o inexistentes, devuelve el estado
 * inicial. Nunca lanza ni interrumpe la aplicación.
 */
export function loadPersistedState(): PersistedDemoStateV1 {
  if (typeof window === "undefined") return cloneInitialPersistedState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneInitialPersistedState();

    const parsed: unknown = JSON.parse(raw);

    // El middleware persist de Zustand envuelve el estado en { state, version }
    // Intentar ambas formas para máxima compatibilidad.
    const candidate =
      parsed &&
      typeof parsed === "object" &&
      "state" in parsed
        ? (parsed as { state: unknown }).state
        : parsed;

    return parsePersistedState(candidate);
  } catch {
    return cloneInitialPersistedState();
  }
}

/**
 * Valida el subconjunto durable que entrega Zustand durante la hidratación.
 * Nunca lanza: cualquier estructura inválida vuelve al estado inicial.
 */
export function parsePersistedState(
  candidate: unknown
): PersistedDemoStateV1 {
  const result = persistedStateSchema.safeParse(candidate);
  if (!result.success) return cloneInitialPersistedState();

  return normalizePersistedState(result.data);
}

/** Evita compartir referencias mutables de arrays y objetos al restaurar. */
export function cloneInitialPersistedState(): PersistedDemoStateV1 {
  return {
    ...initialPersistedState,
    visitedStandIds: [...initialPersistedState.visitedStandIds],
    favoriteStandIds: [...initialPersistedState.favoriteStandIds],
    recentVisits: initialPersistedState.recentVisits.map((visit) => ({
      ...visit,
    })),
    lastKnownLocation: { ...initialPersistedState.lastKnownLocation },
    missionProgress: { ...initialPersistedState.missionProgress },
    specialActionsDone: [...initialPersistedState.specialActionsDone],
    unlockedMissionIds: [...initialPersistedState.unlockedMissionIds],
    redeemedRewardIds: [...initialPersistedState.redeemedRewardIds],
  };
}

/**
 * Storage síncrono y tolerante a fallos para el middleware de Zustand.
 * Safari puede denegar localStorage (por ejemplo, en modo privado); en ese
 * caso la demo continúa en memoria.
 */
export const safeDemoStorage = {
  getItem(name: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      const value = window.localStorage.getItem(name);
      if (value === null) return null;

      JSON.parse(value);
      return value;
    } catch {
      return null;
    }
  },
  setItem(name: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // La demo conserva el estado en memoria si el storage no está disponible.
    }
  },
  removeItem(name: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // La demo conserva el estado en memoria si el storage no está disponible.
    }
  },
};

/**
 * Elimina únicamente la clave de ExpoVia de localStorage.
 * Si `localStorage.removeItem` falla, la operación se ignora silenciosamente.
 */
export function clearPersistedState(): void {
  safeDemoStorage.removeItem(STORAGE_KEY);
}
