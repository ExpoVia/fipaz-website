import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiGet, apiGetAll, apiPost } from "@/lib/api/http-client";
import type { AdjustmentResult, InventoryAdjustment, InventoryItem, InventoryService } from "./types";

/**
 * Servicio de inventario contra el backend (`NEXT_PUBLIC_API_MODE=http`).
 *
 * El formulario ya bloquea los ajustes que dejarían el stock físico por debajo de lo reservado
 * (`adjustments.ts`), pero la regla la impone el servidor: ante un ajuste inválido responde 422
 * y la pantalla muestra su mensaje traducido.
 */

const NOT_FOUND = "No encontramos el inventario solicitado.";
const EVENT_NOT_FOUND = "No encontramos el evento solicitado.";

export const inventoryHttpService: InventoryService = {
  getInventoryByEvent(eventId) {
    return apiGetAll<InventoryItem>(API_ENDPOINTS.inventory.byEvent(eventId), { notFoundMessage: EVENT_NOT_FOUND });
  },

  getInventoryById(inventoryId) {
    return apiGet<InventoryItem>(API_ENDPOINTS.inventory.byId(inventoryId), { notFoundMessage: NOT_FOUND });
  },

  createAdjustment(inventoryId, data) {
    return apiPost<AdjustmentResult>(API_ENDPOINTS.inventory.adjustments(inventoryId), data, {
      notFoundMessage: NOT_FOUND,
    });
  },

  getInventoryHistory(inventoryId) {
    return apiGetAll<InventoryAdjustment>(API_ENDPOINTS.inventory.adjustments(inventoryId), {
      notFoundMessage: NOT_FOUND,
    });
  },
};
