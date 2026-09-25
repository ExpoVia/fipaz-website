import type { BadgeTone } from "@/components/admin/status-badge";
import type { DynamicStatus, DynamicType } from "./types";

export const DYNAMIC_TYPES = [
  "trivia",
  "game",
  "qr_scan",
  "registration",
  "survey",
  "activity",
  "custom",
] as const satisfies readonly DynamicType[];

export const DYNAMIC_STATUSES = ["active", "inactive"] as const satisfies readonly DynamicStatus[];

export const DYNAMIC_TYPE_LABELS: Record<DynamicType, string> = {
  trivia: "Trivia",
  game: "Juego",
  qr_scan: "Escaneo QR",
  registration: "Registro",
  survey: "Encuesta",
  activity: "Actividad",
  custom: "Personalizada",
};

export const DYNAMIC_STATUS_LABELS: Record<DynamicStatus, string> = {
  active: "Activa",
  inactive: "Inactiva",
};

export const DYNAMIC_STATUS_TONES: Record<DynamicStatus, BadgeTone> = {
  active: "success",
  inactive: "neutral",
};

export const DYNAMIC_TYPE_OPTIONS = DYNAMIC_TYPES.map((value) => ({
  value,
  label: DYNAMIC_TYPE_LABELS[value],
}));

export const DYNAMIC_STATUS_OPTIONS = DYNAMIC_STATUSES.map((value) => ({
  value,
  label: DYNAMIC_STATUS_LABELS[value],
}));

export const DYNAMIC_LIMITS = {
  nameMin: 3,
  nameMax: 80,
  descriptionMax: 300,
  pointsMax: 10_000,
} as const;
