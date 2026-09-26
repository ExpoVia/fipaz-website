import { stands } from "@/data/demo-data";
import { MOCK_EXHIBITOR_STAND_ID, PANEL_EVENTS } from "@/data/panel-mock";
import { API_MODE } from "@/lib/api/config";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiGet } from "@/lib/api/http-client";

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

/** Campos de `GET /stands/:standId` que usa el módulo (el resto de la respuesta se ignora). */
interface StandApiResponse {
  id: string;
  displayName: string;
  boothCode: string;
}

/**
 * Datos de contexto (nombre del stand/evento) para títulos y breadcrumbs. Con
 * `NEXT_PUBLIC_API_MODE=http` el stand sale de `GET /stands/:standId` (único endpoint de esta
 * pantalla que ya existe en el backend); el evento sigue saliendo del catálogo estático porque
 * el backend aún no tiene `GET /events/:id`.
 * Es asíncrono a propósito: las páginas ya hacen `await`, así que el cambio no las toca.
 * Un id desconocido no es un error (las empresas registradas en el panel no están en el
 * catálogo estático, y el backend exige UUID): se muestra un nombre derivado del id. Lo mismo
 * si el backend no responde: el título es decorativo y no debe impedir abrir la pantalla.
 */
export const adminScopeService = {
  async getStand(standId: string): Promise<StandSummary> {
    if (API_MODE === "http") {
      try {
        const stand = await apiGet<StandApiResponse>(API_ENDPOINTS.stands.byId(standId));
        return { id: stand.id, name: stand.displayName, boothCode: stand.boothCode };
      } catch {
        // Se usa el catálogo estático / nombre derivado del id.
      }
    }

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
