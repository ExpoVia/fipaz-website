import { fromActivity, fromAttendance, toActivity, type BackendActivity, type BackendAttendance } from "@/features/admin/backend-adapters";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiGet, apiGetAll, apiPatch, apiPost } from "@/lib/api/http-client";
import { ServiceError } from "@/lib/api/service-error";
import type { ActivitiesService, AttendanceUpdate } from "./types";

const NOT_FOUND = "No encontramos la actividad solicitada.";
const STAND_NOT_FOUND = "No encontramos el stand solicitado.";

export const activitiesHttpService: ActivitiesService = {
  async getActivitiesByStand(standId) {
    const rows = await apiGetAll<BackendActivity>(API_ENDPOINTS.activities.manageByStand(standId), { notFoundMessage: STAND_NOT_FOUND });
    return rows.map(fromActivity);
  },
  async getActivityById(activityId) {
    return fromActivity(await apiGet<BackendActivity>(API_ENDPOINTS.activities.manageById(activityId), { notFoundMessage: NOT_FOUND }));
  },
  async createActivity({ standId, ...fields }) {
    const row = await apiPost<BackendActivity>(API_ENDPOINTS.activities.byStand(standId), toActivity(fields), { notFoundMessage: STAND_NOT_FOUND });
    return fromActivity(row);
  },
  async updateActivity(activityId, data) {
    const current = await apiGet<BackendActivity>(API_ENDPOINTS.activities.manageById(activityId), { notFoundMessage: NOT_FOUND });
    if (!current.standId) throw new ServiceError("VALIDATION", "Esta actividad no pertenece a un stand.");
    const row = await apiPatch<BackendActivity>(API_ENDPOINTS.activities.byStandAndId(current.standId, activityId), toActivity(data), { notFoundMessage: NOT_FOUND });
    return fromActivity(row);
  },
  async cancelActivity(activityId) {
    const current = await apiGet<BackendActivity>(API_ENDPOINTS.activities.manageById(activityId), { notFoundMessage: NOT_FOUND });
    if (!current.standId) throw new ServiceError("VALIDATION", "Esta actividad no pertenece a un stand.");
    const row = await apiPatch<BackendActivity>(API_ENDPOINTS.activities.byStandAndId(current.standId, activityId), { status: "cancelled" }, { notFoundMessage: NOT_FOUND });
    return fromActivity(row);
  },
  async getAttendance(activityId) {
    const rows = await apiGetAll<BackendAttendance>(API_ENDPOINTS.activities.attendance(activityId), { notFoundMessage: NOT_FOUND });
    return rows.map(fromAttendance);
  },
  async markAttendance(activityId, participantId): Promise<AttendanceUpdate> {
    const row = await apiPost<BackendAttendance>(API_ENDPOINTS.activities.attendance(activityId), { userId: participantId, method: "manual" }, { notFoundMessage: NOT_FOUND });
    const activity = await this.getActivityById(activityId);
    return { record: fromAttendance(row), activity };
  },
  markAbsent() {
    throw new ServiceError("VALIDATION", "El backend todavía no registra ausencias.");
  },
  revertAttendance() {
    throw new ServiceError("VALIDATION", "El backend todavía no permite revertir asistencias.");
  },
};
