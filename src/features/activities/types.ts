export type ActivityStatus = "draft" | "scheduled" | "in_progress" | "finished" | "cancelled";

export interface Activity {
  id: string;
  standId: string;
  name: string;
  description?: string;
  /** Fecha calendario `YYYY-MM-DD`. */
  date: string;
  /** Hora `HH:mm` (24 h). */
  startTime: string;
  /** Hora `HH:mm` (24 h). */
  endTime?: string;
  capacity: number;
  /** Participantes con registro vigente (no cancelado). */
  registered: number;
  /** Participantes con asistencia confirmada. */
  attendees: number;
  points: number;
  status: ActivityStatus;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** Datos editables de una actividad (lo que envía el formulario). */
export interface ActivityInput {
  name: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  capacity: number;
  points: number;
  status: ActivityStatus;
}

export interface CreateActivityInput extends ActivityInput {
  standId: string;
}

export type RegistrationStatus = "registered" | "cancelled";
export type AttendanceStatus = "pending" | "present" | "absent";

/** Estado único de un participante que resume registro y asistencia (se usa para filtrar). */
export type ParticipantState = "registered" | "present" | "absent" | "cancelled";

export interface AttendanceRecord {
  id: string;
  activityId: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  registrationStatus: RegistrationStatus;
  attendanceStatus: AttendanceStatus;
  /** ISO 8601 */
  registeredAt: string;
  /** ISO 8601. Solo si la asistencia está confirmada. */
  arrivedAt?: string;
  pointsAwarded: number;
}

/** Resultado de cambiar la asistencia: el registro y la actividad con sus contadores al día. */
export interface AttendanceUpdate {
  record: AttendanceRecord;
  activity: Activity;
}

/**
 * Contrato del servicio. La implementación actual es simulada; la HTTP futura debe
 * respetar estas firmas. `revertAttendance` no figuraba en el listado original pero la
 * pantalla de asistencia lo necesita (acción "Revertir asistencia").
 */
export interface ActivitiesService {
  /** GET /stands/:standId/activities (propuesta) */
  getActivitiesByStand(standId: string): Promise<Activity[]>;
  /** GET /activities/:activityId (propuesta) */
  getActivityById(activityId: string): Promise<Activity>;
  /** POST /stands/:standId/activities (propuesta) */
  createActivity(data: CreateActivityInput): Promise<Activity>;
  /** PUT /activities/:activityId (propuesta) */
  updateActivity(activityId: string, data: ActivityInput): Promise<Activity>;
  /** POST /activities/:activityId/cancel (propuesta) */
  cancelActivity(activityId: string): Promise<Activity>;
  /** GET /activities/:activityId/attendance (propuesta) */
  getAttendance(activityId: string): Promise<AttendanceRecord[]>;
  /** PUT /activities/:activityId/attendance/:participantId { status: "present" } (propuesta) */
  markAttendance(activityId: string, participantId: string): Promise<AttendanceUpdate>;
  /** PUT /activities/:activityId/attendance/:participantId { status: "absent" } (propuesta) */
  markAbsent(activityId: string, participantId: string): Promise<AttendanceUpdate>;
  /** PUT /activities/:activityId/attendance/:participantId { status: "pending" } (propuesta) */
  revertAttendance(activityId: string, participantId: string): Promise<AttendanceUpdate>;
}
