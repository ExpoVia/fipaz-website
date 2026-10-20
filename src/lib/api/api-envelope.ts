/**
 * Formato de respuesta del backend (`fexpo-backend`):
 * - éxito: `{ success: true, data, meta }`
 * - error: `{ success: false, error: { code, message, details } }`
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Devuelve `data` si el payload es un envelope exitoso; si no, el payload tal cual. */
export function unwrapEnvelope(payload: unknown): unknown {
  return isRecord(payload) && payload.success === true && "data" in payload ? payload.data : payload;
}

/**
 * Mensaje legible de un error del backend. Prefiere `error.message`; si el backend
 * envía una lista de validaciones en `error.details`, la anexa.
 */
export function readApiErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;
  const error = isRecord(payload.error) ? payload.error : payload;
  const message = typeof error.message === "string" ? error.message : undefined;
  const code = typeof error.code === "string" ? error.code : undefined;
  const details = Array.isArray(error.details)
    ? error.details.filter((item): item is string => typeof item === "string")
    : [];
  const base = message ?? code ?? fallback;
  return details.length > 0 ? `${base} ${details.join(" · ")}` : base;
}
