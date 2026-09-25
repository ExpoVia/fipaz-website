/**
 * Contrato de rutas del backend para el módulo administrativo.
 *
 * IMPORTANTE: hoy NADA consume estas rutas; los servicios de cada feature trabajan
 * con datos simulados. Existen para que la futura implementación HTTP de los servicios
 * (misma interfaz, distinto origen de datos) no dependa de URLs sueltas. Los componentes
 * nunca deben importar este archivo.
 *
 * Las rutas marcadas como "(propuesta)" no están definidas todavía por backend.
 */
export const API_ENDPOINTS = {
  dynamics: {
    /** GET (listar) · POST (crear) */
    byStand: (standId: string) => `/stands/${standId}/dynamics`,
    /** PUT (editar) · DELETE (eliminar) */
    byId: (dynamicId: string) => `/dynamics/${dynamicId}`,
    /** PATCH (activar/desactivar) */
    status: (dynamicId: string) => `/dynamics/${dynamicId}/status`,
  },
  rewards: {
    /** GET (listar) · POST (crear) */
    byEvent: (eventId: string) => `/events/${eventId}/rewards`,
    /** GET · PUT · DELETE */
    byId: (rewardId: string) => `/rewards/${rewardId}`,
    /** PATCH (activar/desactivar) — propuesta */
    status: (rewardId: string) => `/rewards/${rewardId}/status`,
  },
  inventory: {
    /** GET */
    byEvent: (eventId: string) => `/events/${eventId}/inventory`,
    /** GET */
    byId: (inventoryId: string) => `/inventory/${inventoryId}`,
    /** GET (historial) · POST (registrar ajuste) */
    adjustments: (inventoryId: string) => `/inventory/${inventoryId}/adjustments`,
  },
  activities: {
    /** GET · POST — propuesta */
    byStand: (standId: string) => `/stands/${standId}/activities`,
    /** GET · PUT — propuesta */
    byId: (activityId: string) => `/activities/${activityId}`,
    /** POST (cancelar) — propuesta */
    cancel: (activityId: string) => `/activities/${activityId}/cancel`,
    /** GET (lista de participantes) — propuesta */
    attendance: (activityId: string) => `/activities/${activityId}/attendance`,
    /** PUT (present | absent | pending) — propuesta */
    participantAttendance: (activityId: string, participantId: string) =>
      `/activities/${activityId}/attendance/${participantId}`,
  },
} as const;
