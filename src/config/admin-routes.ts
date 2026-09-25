/** Rutas de navegación del módulo administrativo (URLs de la app, no del backend). */
export const adminRoutes = {
  home: () => "/admin",
  dynamics: (standId: string) => `/admin/stands/${standId}/dynamics`,
  activities: (standId: string) => `/admin/stands/${standId}/activities`,
  rewards: (eventId: string) => `/admin/events/${eventId}/rewards`,
  /** Con `rewardId` abre el inventario filtrado por ese premio. */
  inventory: (eventId: string, rewardId?: string) =>
    `/admin/events/${eventId}/inventory${rewardId ? `?reward=${encodeURIComponent(rewardId)}` : ""}`,
  /** Con `status` abre la asistencia filtrada (registered | present | absent | cancelled). */
  attendance: (activityId: string, status?: string) =>
    `/admin/activities/${activityId}/attendance${status ? `?status=${encodeURIComponent(status)}` : ""}`,
} as const;
