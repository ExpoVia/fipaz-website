import { stands } from "@/data/demo-data";
import { MOCK_EXHIBITOR_STAND_ID, PANEL_EVENTS } from "@/data/panel-mock";

/** Contexto por defecto del panel de empresa mientras no exista selección de cuenta real. */
export const ADMIN_DEFAULT_STAND_ID = MOCK_EXHIBITOR_STAND_ID;
export const ADMIN_DEFAULT_EVENT_ID = "event-fipaz-2026";

/** Stand y evento sobre los que trabaja el administrador. */
export interface AdminScope {
  standId: string;
  eventId: string;
}

export interface StandSummary {
  id: string;
  name: string;
  boothCode?: string;
}

export interface EventSummary {
  id: string;
  name: string;
  city?: string;
}

/** "stand-altura-labs" → "Altura Labs". Fallback para ids que el catálogo no conoce. */
function humanizeId(id: string): string {
  return id
    .replace(/^(stand|event)-/, "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Datos de contexto (nombre del stand/evento) para títulos y breadcrumbs. Hoy salen del
 * catálogo estático de la demo; con backend serán `GET /stands/:id` y `GET /events/:id`.
 * Es asíncrono a propósito: las páginas ya hacen `await`, así que el cambio no las toca.
 * Un id desconocido no es un error (las empresas registradas en el panel no están en el
 * catálogo estático): se muestra un nombre derivado del id.
 */
export const adminScopeService = {
  async getStand(standId: string): Promise<StandSummary> {
    const stand = stands.find((item) => item.id === standId);
    return stand
      ? { id: stand.id, name: stand.name, boothCode: stand.boothCode }
      : { id: standId, name: humanizeId(standId) };
  },

  async getEvent(eventId: string): Promise<EventSummary> {
    const event = PANEL_EVENTS.find((item) => item.id === eventId);
    return event
      ? { id: event.id, name: event.name, city: event.city }
      : { id: eventId, name: humanizeId(eventId) };
  },

  async getDefaultScope(): Promise<{ stand: StandSummary; event: EventSummary }> {
    const [stand, event] = await Promise.all([
      this.getStand(ADMIN_DEFAULT_STAND_ID),
      this.getEvent(ADMIN_DEFAULT_EVENT_ID),
    ]);
    return { stand, event };
  },
};
