import type { FlashPromotion, PanelEventSummary, PanelLead, StandCheckIn } from "@/types/panel";

/** Empresa de ejemplo para la vista de Expositor: no hay sesión real, es un mock fijo. */
export const MOCK_EXHIBITOR_STAND_ID = "stand-altura-labs";

export const panelCheckIns: readonly StandCheckIn[] = [
  { id: "checkin-1", standId: MOCK_EXHIBITOR_STAND_ID, visitorLabel: "Visitante #4821", checkedInAt: "2026-09-10T10:12:00-04:00" },
  { id: "checkin-2", standId: MOCK_EXHIBITOR_STAND_ID, visitorLabel: "Visitante #4835", checkedInAt: "2026-09-10T10:47:00-04:00" },
  { id: "checkin-3", standId: MOCK_EXHIBITOR_STAND_ID, visitorLabel: "Visitante #4902", checkedInAt: "2026-09-10T11:20:00-04:00" },
  { id: "checkin-4", standId: MOCK_EXHIBITOR_STAND_ID, visitorLabel: "Visitante #5018", checkedInAt: "2026-09-10T13:05:00-04:00" },
  { id: "checkin-5", standId: MOCK_EXHIBITOR_STAND_ID, visitorLabel: "Visitante #5122", checkedInAt: "2026-09-10T15:41:00-04:00" },
] as const;

export const panelPromotions: readonly FlashPromotion[] = [
  {
    id: "promo-1",
    standId: MOCK_EXHIBITOR_STAND_ID,
    title: "20% en consultoría de automatización",
    discountLabel: "-20%",
    activeFrom: "2026-09-10T09:00:00-04:00",
    activeTo: "2026-09-10T12:00:00-04:00",
    status: "finalizada",
  },
  {
    id: "promo-2",
    standId: MOCK_EXHIBITOR_STAND_ID,
    title: "Diagnóstico gratuito de procesos",
    discountLabel: "Gratis",
    activeFrom: "2026-09-10T14:00:00-04:00",
    activeTo: "2026-09-10T17:00:00-04:00",
    status: "activa",
  },
  {
    id: "promo-3",
    standId: MOCK_EXHIBITOR_STAND_ID,
    title: "Descuento por referido",
    discountLabel: "-15%",
    activeFrom: "2026-09-11T09:00:00-04:00",
    activeTo: "2026-09-11T18:00:00-04:00",
    status: "programada",
  },
] as const;

export const panelLeads: readonly PanelLead[] = [
  { id: "lead-1", standId: MOCK_EXHIBITOR_STAND_ID, name: "Camila Rojas", email: "camila.rojas@example.com", interestTag: "Automatización", capturedAt: "2026-09-10T10:15:00-04:00" },
  { id: "lead-2", standId: MOCK_EXHIBITOR_STAND_ID, name: "Marco Quispe", email: "marco.quispe@example.com", interestTag: "Integraciones API", capturedAt: "2026-09-10T11:25:00-04:00" },
  { id: "lead-3", standId: MOCK_EXHIBITOR_STAND_ID, name: "Fátima Choque", email: "fatima.choque@example.com", interestTag: "Consultoría", capturedAt: "2026-09-10T13:10:00-04:00" },
] as const;

export const PANEL_EVENTS: readonly PanelEventSummary[] = [
  {
    id: "event-fipaz-2026",
    name: "FIPAZ 2026",
    city: "La Paz, Bolivia",
    status: "actual",
    description: "Feria Internacional de La Paz. Plataforma de prueba y desarrollo conceptual.",
  },
  {
    id: "event-expocruz",
    name: "Expocruz",
    city: "Santa Cruz, Bolivia",
    status: "proximamente",
    description: "Expansión proyectada para ferias multisectoriales de gran escala.",
  },
  {
    id: "event-la-paz-expone",
    name: "La Paz Expone",
    city: "La Paz, Bolivia",
    status: "plantilla",
    description: "Integración modular para eventos empresariales e industriales.",
  },
] as const;
