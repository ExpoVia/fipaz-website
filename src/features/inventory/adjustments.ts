import { LOW_STOCK_THRESHOLD } from "./constants";
import type { AdjustmentType, Inventory, StockLevel, StockTotals } from "./types";

/**
 * Reglas de negocio de los ajustes, compartidas por el formulario (validación en vivo) y por
 * el servicio (que las vuelve a aplicar: el backend real nunca debe confiar en el cliente).
 */

/** Nuevo stock físico tras aplicar un ajuste. `correction` fija el valor; el resto suma o resta. */
export function computeNewOnHand(onHand: number, type: AdjustmentType, quantity: number): number {
  switch (type) {
    case "increment":
    case "restock":
      return onHand + quantity;
    case "decrement":
    case "damage_loss":
      return onHand - quantity;
    case "correction":
      return quantity;
  }
}

/**
 * Motivo por el que un ajuste no es válido, o `null` si se puede aplicar. El stock físico
 * nunca puede quedar por debajo de las unidades reservadas, porque el disponible sería
 * negativo (esto incluye la regla de no bajar de cero).
 */
export function getAdjustmentBlocker(
  inventory: Pick<Inventory, "onHand" | "reserved">,
  type: AdjustmentType,
  quantity: number,
): string | null {
  const newOnHand = computeNewOnHand(inventory.onHand, type, quantity);
  if (newOnHand >= inventory.reserved) return null;

  const { onHand, reserved } = inventory;
  if (type === "correction") {
    return `El stock físico no puede quedar por debajo de las ${reserved} unidades reservadas.`;
  }
  return reserved > 0
    ? `Solo puedes reducir hasta ${onHand - reserved} unidades disponibles; las otras ${reserved} están reservadas.`
    : `No puedes reducir más del stock físico actual (${onHand}).`;
}

export function getStockLevel({ available }: Pick<StockTotals, "available">): StockLevel {
  if (available <= 0) return "out";
  return available <= LOW_STOCK_THRESHOLD ? "low" : "ok";
}
