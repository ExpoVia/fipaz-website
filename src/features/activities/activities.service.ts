import { ServiceError } from "@/lib/api/service-error";
import { createMockId, mockRequest } from "@/lib/mock/mock-runtime";
import { activitiesStore, attendanceStore } from "./activities.mock";
import type {
  ActivitiesService,
  Activity,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceUpdate,
} from "./types";

/**
 * Servicio de actividades y asistencia.
 *
 * Implementación SIMULADA sobre `activitiesStore` y `attendanceStore` (memoria +
 * sessionStorage). Los contadores `registered` y `attendees` se recalculan desde los
 * registros de asistencia, como lo haría el backend. Para conectar el backend, reemplaza el
 * cuerpo de cada método por la llamada HTTP indicada (ver `API_ENDPOINTS.activities`) y elimina
 * `activities.mock.ts`; la firma pública no cambia.
 */

function requireActivity(activityId: string): Activity {
  const activity = activitiesStore.find(activityId);
  if (!activity) throw new ServiceError("NOT_FOUND", "No encontramos la actividad solicitada.");
  return activity;
}

function syncCounts(activityId: string): Activity {
  const records = attendanceStore.all().filter((record) => record.activityId === activityId);
  return activitiesStore.patch(activityId, {
    registered: records.filter((record) => record.registrationStatus === "registered").length,
    attendees: records.filter((record) => record.attendanceStatus === "present").length,
  }) as Activity;
}

function changeAttendance(activityId: string, participantId: string, next: AttendanceStatus): AttendanceUpdate {
  const activity = requireActivity(activityId);
  if (activity.status === "cancelled") {
    throw new ServiceError("CONFLICT", "La actividad está cancelada; no se puede modificar la asistencia.");
  }

  const record = attendanceStore
    .all()
    .find((item) => item.activityId === activityId && item.participantId === participantId);
  if (!record) throw new ServiceError("NOT_FOUND", "No encontramos al participante en esta actividad.");
  if (record.registrationStatus === "cancelled") {
    throw new ServiceError("CONFLICT", "El registro de este participante fue cancelado.");
  }

  const updatedRecord = attendanceStore.patch(record.id, {
    attendanceStatus: next,
    arrivedAt: next === "present" ? new Date().toISOString() : undefined,
    pointsAwarded: next === "present" ? activity.points : 0,
  }) as AttendanceRecord;

  return { record: updatedRecord, activity: syncCounts(activityId) };
}

export const activitiesService: ActivitiesService = {
  // GET /stands/:standId/activities
  getActivitiesByStand(standId) {
    return mockRequest(() =>
      activitiesStore
        .all()
        .filter((activity) => activity.standId === standId)
        .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)),
    );
  },

  // GET /activities/:activityId
  getActivityById(activityId) {
    return mockRequest(() => requireActivity(activityId));
  },

  // POST /stands/:standId/activities
  createActivity(data) {
    return mockRequest(() => {
      const now = new Date().toISOString();
      return activitiesStore.insert({
        id: createMockId("act"),
        ...data,
        registered: 0,
        attendees: 0,
        createdAt: now,
        updatedAt: now,
      });
    });
  },

  // PUT /activities/:activityId
  updateActivity(activityId, data) {
    return mockRequest(() => {
      const activity = requireActivity(activityId);
      if (data.capacity < activity.registered) {
        throw new ServiceError(
          "VALIDATION",
          `La capacidad no puede ser menor a los ${activity.registered} participantes ya registrados.`,
        );
      }
      return activitiesStore.patch(activityId, { ...data, updatedAt: new Date().toISOString() }) as Activity;
    });
  },

  // POST /activities/:activityId/cancel
  cancelActivity(activityId) {
    return mockRequest(() => {
      const activity = requireActivity(activityId);
      if (activity.status === "cancelled") {
        throw new ServiceError("CONFLICT", "La actividad ya estaba cancelada.");
      }
      if (activity.status === "finished") {
        throw new ServiceError("CONFLICT", "No se puede cancelar una actividad que ya finalizó.");
      }
      return activitiesStore.patch(activityId, {
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      }) as Activity;
    });
  },

  // GET /activities/:activityId/attendance
  getAttendance(activityId) {
    return mockRequest(() => {
      requireActivity(activityId);
      return attendanceStore
        .all()
        .filter((record) => record.activityId === activityId)
        .sort((a, b) => a.participantName.localeCompare(b.participantName, "es"));
    });
  },

  // PUT /activities/:activityId/attendance/:participantId  { status: "present" }
  markAttendance(activityId, participantId) {
    return mockRequest(() => changeAttendance(activityId, participantId, "present"));
  },

  // PUT /activities/:activityId/attendance/:participantId  { status: "absent" }
  markAbsent(activityId, participantId) {
    return mockRequest(() => changeAttendance(activityId, participantId, "absent"));
  },

  // PUT /activities/:activityId/attendance/:participantId  { status: "pending" }
  revertAttendance(activityId, participantId) {
    return mockRequest(() => changeAttendance(activityId, participantId, "pending"));
  },
};
