import { z } from "zod";

import { formatNumber } from "@/lib/format";
import { hasIssueOn, optionalText, requiredInteger, requiredText } from "@/lib/validation/fields";
import { getAdjustmentBlocker } from "./adjustments";
import { ADJUSTMENT_LIMITS, ADJUSTMENT_TYPES } from "./constants";
import type { AdjustmentInput, AdjustmentType, Inventory } from "./types";

export interface AdjustmentFormValues extends Record<string, string> {
  type: string;
  quantity: string;
  reason: string;
  note: string;
}

export const emptyAdjustmentFormValues: AdjustmentFormValues = {
  type: "",
  quantity: "",
  reason: "",
  note: "",
};

/**
 * El esquema depende del inventario actual porque la regla "no reducir por debajo de cero"
 * (en concreto, por debajo de lo reservado) se evalúa contra sus existencias.
 */
export function createAdjustmentSchema(inventory: Pick<Inventory, "onHand" | "reserved">) {
  return z
    .object({
      type: z.enum(ADJUSTMENT_TYPES, { error: "Selecciona el tipo de ajuste." }),
      quantity: requiredInteger({
        required: "Ingresa la cantidad.",
        invalid: "La cantidad debe ser un número entero, sin letras, símbolos ni decimales.",
        negative: "La cantidad no puede ser negativa.",
        min: { value: 1, message: "La cantidad debe ser mayor a 0." },
        max: {
          value: ADJUSTMENT_LIMITS.quantityMax,
          message: `La cantidad no puede superar ${formatNumber(ADJUSTMENT_LIMITS.quantityMax)}.`,
        },
      }),
      reason: requiredText({
        required: "Indica el motivo del ajuste.",
        min: { value: ADJUSTMENT_LIMITS.reasonMin, message: `El motivo debe tener al menos ${ADJUSTMENT_LIMITS.reasonMin} caracteres.` },
        max: { value: ADJUSTMENT_LIMITS.reasonMax, message: `El motivo no puede superar los ${ADJUSTMENT_LIMITS.reasonMax} caracteres.` },
      }),
      note: optionalText({
        max: { value: ADJUSTMENT_LIMITS.noteMax, message: `La observación no puede superar los ${ADJUSTMENT_LIMITS.noteMax} caracteres.` },
      }),
    })
    .refine((value) => getAdjustmentBlocker(inventory, value.type, value.quantity) === null, {
      path: ["quantity"],
      // Corre aunque el motivo o la nota sean inválidos, pero solo si tipo y cantidad ya lo son.
      when: (payload) => !hasIssueOn(payload, "type", "quantity"),
      error: (issue) => {
        const { type, quantity } = issue.input as { type: AdjustmentType; quantity: number };
        return getAdjustmentBlocker(inventory, type, quantity) ?? "La cantidad no es válida.";
      },
    }) satisfies z.ZodType<AdjustmentInput>;
}
