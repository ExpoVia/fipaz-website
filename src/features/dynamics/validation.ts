import { z } from "zod";

import { formatNumber } from "@/lib/format";
import { optionalText, requiredInteger, requiredText } from "@/lib/validation/fields";
import { DYNAMIC_LIMITS, DYNAMIC_STATUSES, DYNAMIC_TYPES } from "./constants";
import type { Dynamic, DynamicInput } from "./types";

/** Valores del formulario: siempre cadenas, tal como los entrega cada control. */
export interface DynamicFormValues extends Record<string, string> {
  name: string;
  description: string;
  type: string;
  points: string;
  status: string;
}

export const dynamicFormSchema = z.object({
  name: requiredText({
    required: "Ingresa el nombre de la dinámica.",
    min: { value: DYNAMIC_LIMITS.nameMin, message: `El nombre debe tener al menos ${DYNAMIC_LIMITS.nameMin} caracteres.` },
    max: { value: DYNAMIC_LIMITS.nameMax, message: `El nombre no puede superar los ${DYNAMIC_LIMITS.nameMax} caracteres.` },
  }),
  description: optionalText({
    max: { value: DYNAMIC_LIMITS.descriptionMax, message: `La descripción no puede superar los ${DYNAMIC_LIMITS.descriptionMax} caracteres.` },
  }),
  type: z.enum(DYNAMIC_TYPES, { error: "Selecciona el tipo de dinámica." }),
  points: requiredInteger({
    required: "Ingresa los puntos que otorga la dinámica.",
    invalid: "Los puntos deben ser un número entero, sin letras, símbolos ni decimales.",
    negative: "Los puntos no pueden ser negativos.",
    max: { value: DYNAMIC_LIMITS.pointsMax, message: `Los puntos no pueden superar ${formatNumber(DYNAMIC_LIMITS.pointsMax)}.` },
  }),
  status: z.enum(DYNAMIC_STATUSES, { error: "Selecciona el estado." }),
}) satisfies z.ZodType<DynamicInput>;

export function getDynamicFormValues(dynamic?: Dynamic): DynamicFormValues {
  return {
    name: dynamic?.name ?? "",
    description: dynamic?.description ?? "",
    type: dynamic?.type ?? "",
    points: dynamic ? String(dynamic.points) : "",
    status: dynamic?.status ?? "active",
  };
}
