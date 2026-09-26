import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiDelete, apiGet, apiGetAll, apiPatch, apiPost, apiPut } from "@/lib/api/http-client";
import type { Dynamic, DynamicsService } from "./types";

/**
 * Servicio de dinámicas contra el backend (`NEXT_PUBLIC_API_MODE=http`).
 *
 * El backend valida los cuerpos con `forbidNonWhitelisted`: una propiedad de más (por ejemplo
 * `standId`, que ya va en la URL) provoca un 400. Por eso solo se envían los campos del formulario.
 */

const NOT_FOUND = "No encontramos la dinámica solicitada.";
const STAND_NOT_FOUND = "No encontramos el stand solicitado.";

export const dynamicsHttpService: DynamicsService = {
  getDynamicsByStand(standId) {
    return apiGetAll<Dynamic>(API_ENDPOINTS.dynamics.byStand(standId), { notFoundMessage: STAND_NOT_FOUND });
  },

  getDynamicById(dynamicId) {
    return apiGet<Dynamic>(API_ENDPOINTS.dynamics.byId(dynamicId), { notFoundMessage: NOT_FOUND });
  },

  createDynamic({ standId, ...fields }) {
    return apiPost<Dynamic>(API_ENDPOINTS.dynamics.byStand(standId), fields, { notFoundMessage: STAND_NOT_FOUND });
  },

  updateDynamic(dynamicId, data) {
    return apiPut<Dynamic>(API_ENDPOINTS.dynamics.byId(dynamicId), data, { notFoundMessage: NOT_FOUND });
  },

  deleteDynamic(dynamicId) {
    return apiDelete(API_ENDPOINTS.dynamics.byId(dynamicId), { notFoundMessage: NOT_FOUND });
  },

  /** Lee el estado vigente y envía el contrario: `PATCH …/status` recibe el estado destino. */
  async toggleDynamicStatus(dynamicId) {
    const current = await apiGet<Dynamic>(API_ENDPOINTS.dynamics.byId(dynamicId), { notFoundMessage: NOT_FOUND });
    return apiPatch<Dynamic>(
      API_ENDPOINTS.dynamics.status(dynamicId),
      { status: current.status === "active" ? "inactive" : "active" },
      { notFoundMessage: NOT_FOUND },
    );
  },
};
