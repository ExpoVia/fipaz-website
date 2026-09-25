import type { BadgeTone } from "@/components/admin/status-badge";
import type { AdjustmentType, StockLevel } from "./types";

export const ADJUSTMENT_TYPES = [
  "increment",
  "decrement",
  "correction",
  "restock",
  "damage_loss",
] as const satisfies readonly AdjustmentType[];

export const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  increment: "Incremento",
  decrement: "Reducción",
  correction: "Corrección",
  restock: "Reposición",
  damage_loss: "Daño/pérdida",
};

/** Qué hace cada tipo sobre el stock físico; se muestra como ayuda en el formulario. */
export const ADJUSTMENT_TYPE_HINTS: Record<AdjustmentType, string> = {
  increment: "Suma unidades al stock físico.",
  decrement: "Resta unidades del stock físico.",
  correction: "Fija el stock físico en la cantidad de un conteo real.",
  restock: "Registra el ingreso de nueva mercadería.",
  damage_loss: "Resta unidades dañadas o extraviadas.",
};

export const ADJUSTMENT_TYPE_OPTIONS = ADJUSTMENT_TYPES.map((value) => ({
  value,
  label: ADJUSTMENT_TYPE_LABELS[value],
}));

export const ADJUSTMENT_TYPE_TONES: Record<AdjustmentType, BadgeTone> = {
  increment: "success",
  restock: "success",
  decrement: "warning",
  damage_loss: "danger",
  correction: "info",
};

export const STOCK_LEVEL_LABELS: Record<StockLevel, string> = {
  ok: "En stock",
  low: "Stock bajo",
  out: "Agotado",
};

export const STOCK_LEVEL_TONES: Record<StockLevel, BadgeTone> = {
  ok: "success",
  low: "warning",
  out: "danger",
};

/** Con esta cantidad disponible (o menos) el inventario se marca como "Stock bajo". */
export const LOW_STOCK_THRESHOLD = 10;

export const ADJUSTMENT_LIMITS = {
  quantityMax: 1_000_000,
  reasonMin: 3,
  reasonMax: 120,
  noteMax: 300,
} as const;
