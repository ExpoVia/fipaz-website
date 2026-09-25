import type { AttendanceRecord, ParticipantState } from "./types";

/**
 * Estado único de un participante. Un registro cancelado manda sobre la asistencia;
 * "registered" significa registrado y aún sin asistencia marcada.
 */
export function getParticipantState(record: AttendanceRecord): ParticipantState {
  if (record.registrationStatus === "cancelled") return "cancelled";
  if (record.attendanceStatus === "present") return "present";
  if (record.attendanceStatus === "absent") return "absent";
  return "registered";
}

export function isParticipantState(value: string | undefined): value is ParticipantState {
  return value === "registered" || value === "present" || value === "absent" || value === "cancelled";
}

export interface AttendanceSummary {
  /** Registros vigentes (excluye cancelados). */
  registered: number;
  present: number;
  absent: number;
  /** Registrados sin asistencia marcada. */
  pending: number;
  cancelled: number;
}

export function summarizeAttendance(records: readonly AttendanceRecord[]): AttendanceSummary {
  const summary: AttendanceSummary = { registered: 0, present: 0, absent: 0, pending: 0, cancelled: 0 };

  for (const record of records) {
    const state = getParticipantState(record);
    if (state === "cancelled") {
      summary.cancelled += 1;
      continue;
    }
    summary.registered += 1;
    if (state === "present") summary.present += 1;
    else if (state === "absent") summary.absent += 1;
    else summary.pending += 1;
  }

  return summary;
}
