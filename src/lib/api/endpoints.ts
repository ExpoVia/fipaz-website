/**
 * Contrato de rutas del backend para el módulo administrativo, relativas a `/api/v1`
 * (el prefijo lo agrega `getApiBaseUrl()`). Las consumen los `*.http-service.ts` de cada
 * feature (activos con `NEXT_PUBLIC_API_MODE=http`); los componentes nunca deben importarlo.
 *
 * Rutas verificadas contra los controladores de `fexpo-backend`.
 */
export const API_ENDPOINTS = {
  health: "/health",
  stands: {
    /** GET /events/:eventId/stands (público) — existe en el backend */
    byEvent: (eventId: string) => `/events/${encodeURIComponent(eventId)}/stands`,
    /** GET (público) — existe en el backend */
    byId: (standId: string) => `/stands/${encodeURIComponent(standId)}`,
  },
  dynamics: {
    /** GET público (solo activas) · POST autenticado */
    byStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/dynamics`,
    manageByStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/manage/dynamics`,
    manageById: (dynamicId: string) => `/dynamics/${encodeURIComponent(dynamicId)}/manage`,
    byStandAndId: (standId: string, dynamicId: string) =>
      `/stands/${encodeURIComponent(standId)}/dynamics/${encodeURIComponent(dynamicId)}`,
    byId: (dynamicId: string) => `/dynamics/${encodeURIComponent(dynamicId)}`,
  },
  rewards: {
    byEvent: (eventId: string) => `/events/${encodeURIComponent(eventId)}/rewards`,
    byId: (eventId: string, rewardId: string) =>
      `/events/${encodeURIComponent(eventId)}/rewards/${encodeURIComponent(rewardId)}`,
  },
  inventory: {
    byEvent: (eventId: string) => `/events/${encodeURIComponent(eventId)}/inventory`,
    byId: (eventId: string, inventoryId: string) =>
      `/events/${encodeURIComponent(eventId)}/inventory/${encodeURIComponent(inventoryId)}`,
    adjustments: (eventId: string, inventoryId: string) =>
      `/events/${encodeURIComponent(eventId)}/inventory/${encodeURIComponent(inventoryId)}/adjustments`,
  },
  activities: {
    byEvent: (eventId: string) => `/events/${encodeURIComponent(eventId)}/activities`,
    byStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/activities`,
    manageByStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/manage/activities`,
    byId: (activityId: string) => `/activities/${encodeURIComponent(activityId)}`,
    manageById: (activityId: string) => `/activities/${encodeURIComponent(activityId)}/manage`,
    byStandAndId: (standId: string, activityId: string) =>
      `/stands/${encodeURIComponent(standId)}/activities/${encodeURIComponent(activityId)}`,
    attendance: (activityId: string) => `/activities/${encodeURIComponent(activityId)}/attendance`,
    register: (activityId: string) => `/activities/${encodeURIComponent(activityId)}/register`,
  },
  checkIns: {
    /** POST — check-in del visitante autenticado con QR/NFC del stand. */
    byStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/check-ins`,
    /** POST — check-in operado por staff con userId o QR personal del visitante. */
    manualByStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/manual-check-ins`,
  },
} as const;
