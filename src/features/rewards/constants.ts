import type { BadgeTone } from "@/components/admin/status-badge";
import type { RewardStatus, RewardType } from "./types";

export const REWARD_TYPES = [
  "merch",
  "voucher",
  "badge",
  "product",
  "experience",
  "other",
] as const satisfies readonly RewardType[];

export const REWARD_STATUSES = ["active", "inactive"] as const satisfies readonly RewardStatus[];

export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  merch: "Merch",
  voucher: "Voucher",
  badge: "Badge",
  product: "Producto",
  experience: "Experiencia",
  other: "Otro",
};

export const REWARD_TYPE_OPTIONS = REWARD_TYPES.map((value) => ({
  value,
  label: REWARD_TYPE_LABELS[value],
}));

export const REWARD_STATUS_LABELS: Record<RewardStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

export const REWARD_STATUS_TONES: Record<RewardStatus, BadgeTone> = {
  active: "success",
  inactive: "neutral",
};

export const REWARD_STATUS_OPTIONS = REWARD_STATUSES.map((value) => ({
  value,
  label: REWARD_STATUS_LABELS[value],
}));

/**
 * Imágenes disponibles en el catálogo de la app. Se elige de una lista cerrada (en lugar de
 * pedir una URL) para no depender de dominios externos; con backend será una subida de archivo.
 */
export const REWARD_IMAGE_PRESETS = [
  { value: "/assets/rewards/backpack-removebg-preview.png", label: "Mochila" },
  { value: "/assets/rewards/tomatodo.png", label: "Tomatodo" },
  { value: "/assets/rewards/coffee.png", label: "Café" },
  { value: "/assets/rewards/poster.png", label: "Póster" },
  { value: "/assets/rewards/ticket.png", label: "Entrada" },
  { value: "/assets/rewards/llavero.png", label: "Llavero" },
] as const;

export const REWARD_IMAGE_OPTIONS = [
  { value: "", label: "Sin imagen (usar ícono)" },
  ...REWARD_IMAGE_PRESETS,
];

export const REWARD_LIMITS = {
  nameMin: 3,
  nameMax: 80,
  descriptionMax: 200,
  costPointsMax: 100_000,
  stockMax: 100_000,
} as const;
