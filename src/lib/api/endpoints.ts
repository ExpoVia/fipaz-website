/**
 * Contrato de rutas del backend para el módulo administrativo, relativas a `/api/v1`
 * (el prefijo lo agrega `getApiBaseUrl()`). Las consumen los `*.http-service.ts` de cada
 * feature (activos con `NEXT_PUBLIC_API_MODE=http`); los componentes nunca deben importarlo.
 *
 * Estado en `fexpo-backend`: `health`, `stands.byEvent`, `stands.byId` existen. Dinámicas, premios, inventario y
 * actividades siguen pendientes en el backend. Las marcadas "(propuesta)" ni siquiera
 * estaban definidas en el enunciado.
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
    /** GET (listar) · POST (crear) */
    byStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/dynamics`,
    /** PUT (editar) · DELETE (eliminar) */
    byId: (dynamicId: string) => `/dynamics/${encodeURIComponent(dynamicId)}`,
    /** PATCH (activar/desactivar) */
    status: (dynamicId: string) => `/dynamics/${encodeURIComponent(dynamicId)}/status`,
  },
  rewards: {
    /** GET (listar) · POST (crear) */
    byEvent: (eventId: string) => `/events/${encodeURIComponent(eventId)}/rewards`,
    /** GET · PUT · DELETE */
    byId: (rewardId: string) => `/rewards/${encodeURIComponent(rewardId)}`,
    /** PATCH (activar/desactivar) — propuesta */
    status: (rewardId: string) => `/rewards/${encodeURIComponent(rewardId)}/status`,
  },
  inventory: {
    /** GET */
    byEvent: (eventId: string) => `/events/${encodeURIComponent(eventId)}/inventory`,
    /** GET */
    byId: (inventoryId: string) => `/inventory/${encodeURIComponent(inventoryId)}`,
    /** GET (historial) · POST (registrar ajuste) */
    adjustments: (inventoryId: string) => `/inventory/${encodeURIComponent(inventoryId)}/adjustments`,
  },
  activities: {
    /** GET · POST — propuesta */
    byStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/activities`,
    /** GET · PUT — propuesta */
    byId: (activityId: string) => `/activities/${encodeURIComponent(activityId)}`,
    /** POST (cancelar) — propuesta */
    cancel: (activityId: string) => `/activities/${encodeURIComponent(activityId)}/cancel`,
    /** GET (lista de participantes) — propuesta */
    attendance: (activityId: string) => `/activities/${encodeURIComponent(activityId)}/attendance`,
    /** PUT (present | absent | pending) — propuesta */
    participantAttendance: (activityId: string, participantId: string) =>
      `/activities/${encodeURIComponent(activityId)}/attendance/${encodeURIComponent(participantId)}`,
  },
  checkIns: {
    /** POST — check-in del visitante autenticado con QR/NFC del stand. */
    byStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/check-ins`,
    /** POST — check-in operado por staff con userId o QR personal del visitante. */
    manualByStand: (standId: string) => `/stands/${encodeURIComponent(standId)}/manual-check-ins`,
  },
} as const;
