import { z } from "zod";

/**
 * Validadores reutilizables para formularios cuyos campos son cadenas (lo que entrega un
 * `<input>`). Cada uno convierte al tipo final (número, undefined) y devuelve un mensaje en
 * español específico, en lugar de mensajes genéricos de Zod.
 */

// Caracteres que no tienen sentido en textos de negocio y suelen indicar pegado accidental
// o intento de inyección de marcado: < > { } \ ` y caracteres de control.
const FORBIDDEN_CHARACTERS = /[<>{}\\`\u0000-\u0008\u000B\u000C\u000E-\u001F]/;
const INTEGER_PATTERN = /^\d+$/;

interface TextFieldOptions {
  required: string;
  min?: { value: number; message: string };
  max: { value: number; message: string };
}

const INVALID_CHARACTERS_MESSAGE = "No uses los caracteres < > { } \\ ` en este campo.";

/** Texto obligatorio: se recorta, exige longitud mínima/máxima y rechaza caracteres inválidos. */
export function requiredText({ required, min, max }: TextFieldOptions) {
  let schema = z.string().trim().min(1, required);
  if (min) schema = schema.min(min.value, min.message);
  return schema
    .max(max.value, max.message)
    .refine((value) => !FORBIDDEN_CHARACTERS.test(value), INVALID_CHARACTERS_MESSAGE);
}

/** Texto opcional: cadena vacía → `undefined`; si viene, respeta el límite y los caracteres válidos. */
export function optionalText({ max }: Pick<TextFieldOptions, "max">) {
  return z
    .string()
    .trim()
    .max(max.value, max.message)
    .refine((value) => !FORBIDDEN_CHARACTERS.test(value), INVALID_CHARACTERS_MESSAGE)
    .transform((value) => (value === "" ? undefined : value));
}

interface IntegerFieldOptions {
  required: string;
  /** Letras, decimales u otros símbolos. */
  invalid: string;
  negative: string;
  min?: { value: number; message: string };
  max: { value: number; message: string };
}

type IntegerResult = { ok: true; value: number } | { ok: false; message: string };

function parseInteger(raw: string, options: IntegerFieldOptions): IntegerResult {
  if (raw === "") return { ok: false, message: options.required };
  if (raw.startsWith("-")) return { ok: false, message: options.negative };
  if (!INTEGER_PATTERN.test(raw)) return { ok: false, message: options.invalid };

  const value = Number(raw);
  if (options.min && value < options.min.value) return { ok: false, message: options.min.message };
  if (value > options.max.value) return { ok: false, message: options.max.message };
  return { ok: true, value };
}

/** Entero obligatorio escrito como texto: rechaza vacío, negativos, decimales y letras. */
export function requiredInteger(options: IntegerFieldOptions) {
  return z.string().trim().transform((raw, ctx): number => {
    const result = parseInteger(raw, options);
    if (!result.ok) {
      ctx.issues.push({ code: "custom", message: result.message, input: raw });
      return z.NEVER;
    }
    return result.value;
  });
}

/** Entero opcional: cadena vacía → `undefined`; si viene, debe ser un entero válido. */
export function optionalInteger(options: Omit<IntegerFieldOptions, "required">) {
  return z.string().trim().transform((raw, ctx): number | undefined => {
    if (raw === "") return undefined;
    const result = parseInteger(raw, { ...options, required: "" });
    if (!result.ok) {
      ctx.issues.push({ code: "custom", message: result.message, input: raw });
      return z.NEVER;
    }
    return result.value;
  });
}

/**
 * ¿Algún campo de `fields` ya tiene errores? Sirve como `when` de una validación cruzada
 * (que solo tiene sentido si los campos que compara son válidos) para que se evalúe aunque
 * otros campos del formulario tengan errores.
 */
export function hasIssueOn(
  payload: { issues?: ReadonlyArray<{ path?: PropertyKey[] }> },
  ...fields: string[]
): boolean {
  return payload.issues?.some((issue) => fields.includes(String(issue.path?.[0]))) ?? false;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Fecha `YYYY-MM-DD` que además exista en el calendario (rechaza 2026-02-31). */
export function requiredDate(messages: { required: string; invalid: string }) {
  return z
    .string()
    .trim()
    .min(1, messages.required)
    .refine((value) => {
      const match = DATE_PATTERN.exec(value);
      if (!match) return false;
      const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }, messages.invalid);
}

/** Hora `HH:mm` de 24 horas. */
export function requiredTime(messages: { required: string; invalid: string }) {
  return z.string().trim().min(1, messages.required).regex(TIME_PATTERN, messages.invalid);
}

/** Hora `HH:mm` opcional: cadena vacía → `undefined`. */
export function optionalTime(messages: { invalid: string }) {
  return z
    .string()
    .trim()
    .refine((value) => value === "" || TIME_PATTERN.test(value), messages.invalid)
    .transform((value) => (value === "" ? undefined : value));
}
