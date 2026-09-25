import type { BadgeTone } from "@/components/admin/status-badge";
import type { ActivityStatus, AttendanceStatus, ParticipantState, RegistrationStatus } from "./types";

export const ACTIVITY_STATUSES = [
  "draft",
  "scheduled",
  "in_progress",
  "finished",
  "cancelled",
] as const satisfies readonly ActivityStatus[];

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  draft: "Borrador",
  scheduled: "Programada",
  in_progress: "En curso",
  finished: "Finalizada",
  cancelled: "Cancelada",
};

export const ACTIVITY_STATUS_TONES: Record<ActivityStatus, BadgeTone> = {
  draft: "neutral",
  scheduled: "info",
  in_progress: "success",
  finished: "accent",
  cancelled: "danger",
};

export const ACTIVITY_STATUS_OPTIONS = ACTIVITY_STATUSES.map((value) => ({
  value,
  label: ACTIVITY_STATUS_LABELS[value],
}));

export const ACTIVITY_LIMITS = {
  nameMin: 3,
  nameMax: 80,
  descriptionMax: 500,
  capacityMax: 10_000,
  pointsMax: 10_000,
} as const;

export const PARTICIPANT_STATE_LABELS: Record<ParticipantState, string> = {
  registered: "Registrado",
  present: "Presente",
  absent: "Ausente",
  cancelled: "Cancelado",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  registered: "Registrado",
  cancelled: "Cancelado",
};

export const REGISTRATION_STATUS_TONES: Record<RegistrationStatus, BadgeTone> = {
  registered: "info",
  cancelled: "neutral",
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  pending: "Pendiente",
  present: "Presente",
  absent: "Ausente",
};

export const ATTENDANCE_STATUS_TONES: Record<AttendanceStatus, BadgeTone> = {
  pending: "warning",
  present: "success",
  absent: "danger",
};
