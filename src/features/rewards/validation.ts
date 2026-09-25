import { z } from "zod";

import { formatNumber } from "@/lib/format";
import { optionalInteger, optionalText, requiredInteger, requiredText } from "@/lib/validation/fields";
import { REWARD_IMAGE_PRESETS, REWARD_LIMITS, REWARD_STATUSES, REWARD_TYPES } from "./constants";
import type { Reward, RewardInput } from "./types";

export interface RewardFormValues extends Record<string, string> {
  name: string;
  description: string;
  type: string;
  costPoints: string;
  imageUrl: string;
  status: string;
  initialStock: string;
}

const IMAGE_VALUES = ["", ...REWARD_IMAGE_PRESETS.map((preset) => preset.value)] as [string, ...string[]];

export const rewardFormSchema = z.object({
  name: requiredText({
    required: "Ingresa el nombre del premio.",
    min: { value: REWARD_LIMITS.nameMin, message: `El nombre debe tener al menos ${REWARD_LIMITS.nameMin} caracteres.` },
    max: { value: REWARD_LIMITS.nameMax, message: `El nombre no puede superar los ${REWARD_LIMITS.nameMax} caracteres.` },
  }),
  description: optionalText({
    max: { value: REWARD_LIMITS.descriptionMax, message: `La descripción no puede superar los ${REWARD_LIMITS.descriptionMax} caracteres.` },
  }),
  type: z.enum(REWARD_TYPES, { error: "Selecciona el tipo de premio." }),
  costPoints: requiredInteger({
    required: "Ingresa el costo en puntos.",
    invalid: "El costo debe ser un número entero, sin letras, símbolos ni decimales.",
    negative: "El costo en puntos no puede ser negativo.",
    max: { value: REWARD_LIMITS.costPointsMax, message: `El costo no puede superar ${formatNumber(REWARD_LIMITS.costPointsMax)} puntos.` },
  }),
  imageUrl: z
    .enum(IMAGE_VALUES, { error: "Selecciona una imagen de la lista." })
    .transform((value) => (value === "" ? undefined : value)),
  status: z.enum(REWARD_STATUSES, { error: "Selecciona el estado." }),
  initialStock: optionalInteger({
    invalid: "El stock debe ser un número entero, sin letras, símbolos ni decimales.",
    negative: "El stock no puede ser negativo.",
    max: { value: REWARD_LIMITS.stockMax, message: `El stock no puede superar ${formatNumber(REWARD_LIMITS.stockMax)} unidades.` },
  }),
}) satisfies z.ZodType<RewardInput>;

export function getRewardFormValues(reward?: Reward): RewardFormValues {
  return {
    name: reward?.name ?? "",
    description: reward?.description ?? "",
    type: reward?.type ?? "",
    costPoints: reward ? String(reward.costPoints) : "",
    imageUrl: reward?.imageUrl ?? "",
    status: reward?.status ?? "active",
    initialStock: "",
  };
}
