import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiDelete, apiGet, apiGetAll, apiPatch, apiPost } from "@/lib/api/http-client";
import { fromDynamic, toDynamic, type BackendDynamic } from "@/features/admin/backend-adapters";
import type { DynamicsService } from "./types";

const NOT_FOUND = "No encontramos la dinámica solicitada.";
const STAND_NOT_FOUND = "No encontramos el stand solicitado.";

/** El panel usa la lectura administrable para incluir dinámicas inactivas. */
export const dynamicsHttpService: DynamicsService = {
  async getDynamicsByStand(standId) {
    const rows = await apiGetAll<BackendDynamic>(API_ENDPOINTS.dynamics.manageByStand(standId), { notFoundMessage: STAND_NOT_FOUND });
    return rows.map(fromDynamic);
  },
  async getDynamicById(dynamicId) {
    return fromDynamic(await apiGet<BackendDynamic>(API_ENDPOINTS.dynamics.manageById(dynamicId), { notFoundMessage: NOT_FOUND }));
  },
  async createDynamic({ standId, ...fields }) {
    const row = await apiPost<BackendDynamic>(API_ENDPOINTS.dynamics.byStand(standId), toDynamic(fields), { notFoundMessage: STAND_NOT_FOUND });
    return fromDynamic(row);
  },
  async updateDynamic(dynamicId, data) {
    const current = await apiGet<BackendDynamic>(API_ENDPOINTS.dynamics.manageById(dynamicId), { notFoundMessage: NOT_FOUND });
    const row = await apiPatch<BackendDynamic>(API_ENDPOINTS.dynamics.byStandAndId(current.standId, dynamicId), toDynamic(data), { notFoundMessage: NOT_FOUND });
    return fromDynamic(row);
  },
  async deleteDynamic(dynamicId) {
    const current = await apiGet<BackendDynamic>(API_ENDPOINTS.dynamics.manageById(dynamicId), { notFoundMessage: NOT_FOUND });
    await apiDelete(API_ENDPOINTS.dynamics.byStandAndId(current.standId, dynamicId), { notFoundMessage: NOT_FOUND });
  },
  async toggleDynamicStatus(dynamicId) {
    const current = await apiGet<BackendDynamic>(API_ENDPOINTS.dynamics.manageById(dynamicId), { notFoundMessage: NOT_FOUND });
    const row = await apiPatch<BackendDynamic>(API_ENDPOINTS.dynamics.byStandAndId(current.standId, dynamicId), { isActive: !current.isActive }, { notFoundMessage: NOT_FOUND });
    return fromDynamic(row);
  },
};
