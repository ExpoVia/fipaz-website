import { z } from "zod";

import { formatNumber } from "@/lib/format";
import {
  hasIssueOn,
  optionalText,
  optionalTime,
  requiredDate,
  requiredInteger,
  requiredText,
  requiredTime,
} from "@/lib/validation/fields";
import { ACTIVITY_LIMITS, ACTIVITY_STATUSES } from "./constants";
import type { Activity, ActivityInput } from "./types";

export interface ActivityFormValues extends Record<string, string> {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
  points: string;
  status: string;
}

/**
 * `minCapacity` es la cantidad de participantes ya registrados: al editar, la capacidad no
 * puede quedar por debajo (quedarían personas registradas sin cupo).
 */
export function createActivitySchema({ minCapacity }: { minCapacity: number }) {
  const smallestCapacity = Math.max(1, minCapacity);

  return z
    .object({
      name: requiredText({
        required: "Ingresa el nombre de la actividad.",
        min: { value: ACTIVITY_LIMITS.nameMin, message: `El nombre debe tener al menos ${ACTIVITY_LIMITS.nameMin} caracteres.` },
        max: { value: ACTIVITY_LIMITS.nameMax, message: `El nombre no puede superar los ${ACTIVITY_LIMITS.nameMax} caracteres.` },
      }),
      description: optionalText({
        max: { value: ACTIVITY_LIMITS.descriptionMax, message: `La descripción no puede superar los ${ACTIVITY_LIMITS.descriptionMax} caracteres.` },
      }),
      date: requiredDate({ required: "Selecciona la fecha de la actividad.", invalid: "La fecha no es válida." }),
      startTime: requiredTime({
        required: "Indica la hora de inicio.",
        invalid: "La hora de inicio no es válida (usa el formato de 24 horas, p. ej. 14:30).",
      }),
      endTime: optionalTime({ invalid: "La hora de finalización no es válida (usa el formato de 24 horas, p. ej. 16:00)." }),
      capacity: requiredInteger({
        required: "Ingresa la capacidad de la actividad.",
        invalid: "La capacidad debe ser un número entero, sin letras, símbolos ni decimales.",
        negative: "La capacidad no puede ser negativa.",
        min: {
          value: smallestCapacity,
          message:
            minCapacity > 1
              ? `La capacidad no puede ser menor a los ${minCapacity} participantes ya registrados.`
              : "La capacidad debe ser mayor a 0.",
        },
        max: { value: ACTIVITY_LIMITS.capacityMax, message: `La capacidad no puede superar ${formatNumber(ACTIVITY_LIMITS.capacityMax)} personas.` },
      }),
      points: requiredInteger({
        required: "Ingresa los puntos que otorga la actividad.",
        invalid: "Los puntos deben ser un número entero, sin letras, símbolos ni decimales.",
        negative: "Los puntos no pueden ser negativos.",
        max: { value: ACTIVITY_LIMITS.pointsMax, message: `Los puntos no pueden superar ${formatNumber(ACTIVITY_LIMITS.pointsMax)}.` },
      }),
      status: z.enum(ACTIVITY_STATUSES, { error: "Selecciona el estado." }),
    })
    .refine((value) => value.endTime === undefined || value.endTime > value.startTime, {
      path: ["endTime"],
      message: "La hora de finalización debe ser posterior a la hora de inicio.",
      // Se evalúa aunque otros campos tengan errores, pero solo si ambas horas ya son válidas.
      when: (payload) => !hasIssueOn(payload, "startTime", "endTime"),
    }) satisfies z.ZodType<ActivityInput>;
}

export function getActivityFormValues(activity?: Activity): ActivityFormValues {
  return {
    name: activity?.name ?? "",
    description: activity?.description ?? "",
    date: activity?.date ?? "",
    startTime: activity?.startTime ?? "",
    endTime: activity?.endTime ?? "",
    capacity: activity ? String(activity.capacity) : "",
    points: activity ? String(activity.points) : "",
    status: activity?.status ?? "draft",
  };
}
