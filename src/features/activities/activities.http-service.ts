import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiGet, apiGetAll, apiPost, apiPut } from "@/lib/api/http-client";
import type { ActivitiesService, Activity, AttendanceRecord, AttendanceStatus, AttendanceUpdate } from "./types";

/**
 * Servicio de actividades y asistencia contra el backend (`NEXT_PUBLIC_API_MODE=http`).
 *
 * Estos endpoints son una propuesta (no estaban definidos): ver `features/admin/README.md`.
 * `standId` va en la URL, no en el cuerpo (el backend usa `forbidNonWhitelisted`). Cambiar la
 * asistencia responde `{ record, activity }` con los contadores de la actividad al día.
 */

const NOT_FOUND = "No encontramos la actividad solicitada.";
const STAND_NOT_FOUND = "No encontramos el stand solicitado.";
const PARTICIPANT_NOT_FOUND = "No encontramos al participante en esta actividad.";

function setAttendance(activityId: string, participantId: string, status: AttendanceStatus) {
  return apiPut<AttendanceUpdate>(
    API_ENDPOINTS.activities.participantAttendance(activityId, participantId),
    { status },
    { notFoundMessage: PARTICIPANT_NOT_FOUND },
  );
}

export const activitiesHttpService: ActivitiesService = {
  getActivitiesByStand(standId) {
    return apiGetAll<Activity>(API_ENDPOINTS.activities.byStand(standId), { notFoundMessage: STAND_NOT_FOUND });
  },

  getActivityById(activityId) {
    return apiGet<Activity>(API_ENDPOINTS.activities.byId(activityId), { notFoundMessage: NOT_FOUND });
  },

  createActivity({ standId, ...fields }) {
    return apiPost<Activity>(API_ENDPOINTS.activities.byStand(standId), fields, { notFoundMessage: STAND_NOT_FOUND });
  },

  updateActivity(activityId, data) {
    return apiPut<Activity>(API_ENDPOINTS.activities.byId(activityId), data, { notFoundMessage: NOT_FOUND });
  },

  cancelActivity(activityId) {
    return apiPost<Activity>(API_ENDPOINTS.activities.cancel(activityId), undefined, { notFoundMessage: NOT_FOUND });
  },

  getAttendance(activityId) {
    return apiGetAll<AttendanceRecord>(API_ENDPOINTS.activities.attendance(activityId), {
      notFoundMessage: NOT_FOUND,
    });
  },

  markAttendance(activityId, participantId) {
    return setAttendance(activityId, participantId, "present");
  },

  markAbsent(activityId, participantId) {
    return setAttendance(activityId, participantId, "absent");
  },

  revertAttendance(activityId, participantId) {
    return setAttendance(activityId, participantId, "pending");
  },
};
