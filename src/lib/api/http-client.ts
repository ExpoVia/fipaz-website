import { getApiBaseUrl } from "./config";
import { ServiceError } from "./service-error";
import type { ServiceErrorCode } from "./service-error";

/**
 * Cliente HTTP del backend (`fexpo-backend`). Habla su contrato:
 *
 *   éxito  → { success: true,  data, meta }          (`meta` con paginación o null)
 *   error  → { success: false, error: { code, message, details } }
 *
 * Todo fallo se traduce a `ServiceError` con un mensaje en español. Los mensajes del backend
 * NO se muestran tal cual: varios llegan en inglés (INTERNAL_ERROR, errores de autenticación,
 * `details` de validación), así que se traducen por `code` o, en su defecto, por estado HTTP.
 * Solo se reenvía el texto de los códigos cuyo mensaje nace en SQL, que el backend redacta en español.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type QueryValue = string | number | boolean | undefined;

export interface RequestOptions {
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Mensaje para un 404 sin código propio, p. ej. "No encontramos la dinámica solicitada.". */
  notFoundMessage?: string;
}

interface ApiResult<T> {
  data: T;
  meta: PaginationMeta | null;
}

interface ErrorBody {
  code?: unknown;
  message?: unknown;
  details?: unknown;
}

const REQUEST_TIMEOUT_MS = 15_000;
/** Tope de seguridad al recorrer páginas: evita bucles si `meta` llegara mal formado. */
const MAX_PAGES = 50;
/** Longitud máxima de un mensaje del backend que se reenvía a la UI. */
const MAX_PASSTHROUGH_LENGTH = 200;

const SESSION_MESSAGE = "Tu sesión expiró o no has iniciado sesión. Inicia sesión e intenta nuevamente.";
const FORBIDDEN_MESSAGE = "No tienes permisos para realizar esta acción.";
const VALIDATION_MESSAGE = "Algunos datos no son válidos. Revisa el formulario e intenta nuevamente.";
const CONFLICT_MESSAGE =
  "La operación no se pudo completar porque el registro cambió. Actualiza la página e intenta nuevamente.";
const SERVER_MESSAGE = "El servidor no pudo procesar la solicitud. Intenta nuevamente en unos minutos.";

/** Códigos que emite el backend, con su traducción. */
const KNOWN_ERRORS: Readonly<Record<string, readonly [ServiceErrorCode, string]>> = {
  AUTH_REQUIRED: ["UNAUTHORIZED", SESSION_MESSAGE],
  INVALID_GOOGLE_TOKEN: ["UNAUTHORIZED", SESSION_MESSAGE],
  INVALID_REFRESH_TOKEN: ["UNAUTHORIZED", SESSION_MESSAGE],
  SESSION_REVOKED: ["UNAUTHORIZED", SESSION_MESSAGE],
  FORBIDDEN: ["FORBIDDEN", FORBIDDEN_MESSAGE],
  INSUFFICIENT_PERMISSIONS: ["FORBIDDEN", FORBIDDEN_MESSAGE],
  USER_SUSPENDED: ["FORBIDDEN", "Tu cuenta está suspendida. Contacta al organizador del evento."],
  STAND_NOT_FOUND: ["NOT_FOUND", "No encontramos el stand solicitado."],
  EVENT_NOT_FOUND: ["NOT_FOUND", "No encontramos el evento solicitado."],
  USER_NOT_FOUND: ["NOT_FOUND", "No encontramos al usuario solicitado."],
  EVENT_NOT_ACTIVE: ["VALIDATION", "El evento no tiene una jornada activa en este momento."],
  STAND_NOT_ACTIVE: ["VALIDATION", "El stand no está activo."],
  VALIDATION_ERROR: ["VALIDATION", VALIDATION_MESSAGE],
  CONFLICT: ["CONFLICT", CONFLICT_MESSAGE],
  IDEMPOTENCY_CONFLICT: ["CONFLICT", CONFLICT_MESSAGE],
  TOO_MANY_REQUESTS: ["UNKNOWN", "Hiciste demasiadas solicitudes seguidas. Espera unos segundos e intenta nuevamente."],
  INTERNAL_ERROR: ["NETWORK", SERVER_MESSAGE],
};

/** Códigos cuyo mensaje sale de un `RAISE EXCEPTION` del SQL, redactado en español. */
const PASSTHROUGH_CODES: ReadonlySet<string> = new Set(["RESOURCE_NOT_FOUND", "PG_ERROR"]);

function fromStatus(status: number, notFoundMessage: string | undefined): ServiceError {
  if (status === 401) return new ServiceError("UNAUTHORIZED", SESSION_MESSAGE);
  if (status === 403) return new ServiceError("FORBIDDEN", FORBIDDEN_MESSAGE);
  if (status === 404) return new ServiceError("NOT_FOUND", notFoundMessage ?? "No encontramos lo que estás buscando.");
  if (status === 409) return new ServiceError("CONFLICT", CONFLICT_MESSAGE);
  if (status === 400 || status === 422) return new ServiceError("VALIDATION", VALIDATION_MESSAGE);
  if (status >= 500) return new ServiceError("NETWORK", SERVER_MESSAGE);
  return new ServiceError("UNKNOWN", "No pudimos completar la acción. Intenta nuevamente.");
}

/** Convierte una respuesta de error del backend en un `ServiceError` en español. */
function translateError(status: number, body: ErrorBody | null, notFoundMessage: string | undefined): ServiceError {
  const code = typeof body?.code === "string" ? body.code : undefined;

  if (code) {
    const known = KNOWN_ERRORS[code];
    if (known) return new ServiceError(known[0], known[1]);

    const message = body?.message;
    if (
      PASSTHROUGH_CODES.has(code) &&
      typeof message === "string" &&
      message.trim() !== "" &&
      message.length <= MAX_PASSTHROUGH_LENGTH
    ) {
      return new ServiceError(status === 404 ? "NOT_FOUND" : "VALIDATION", message.trim());
    }
  }

  // Sin código conocido (p. ej. el 404 genérico de Nest o un 400 de ParseUUIDPipe): se decide por estado HTTP,
  // usando el mensaje de la entidad que pidió el servicio cuando es un 404.
  return fromStatus(status, notFoundMessage);
}

let accessTokenProvider: () => string | null = () => null;

/**
 * Registra de dónde sale el token de acceso (JWT). El módulo de inicio de sesión debe llamarlo
 * una vez; mientras no exista, las rutas protegidas del backend responderán 401 (AUTH_REQUIRED).
 */
export function setAccessTokenProvider(provider: () => string | null): void {
  accessTokenProvider = provider;
}

function buildUrl(path: string, query: RequestOptions["query"]): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const queryString = params.toString();
  return `${getApiBaseUrl()}${path}${queryString ? `?${queryString}` : ""}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  { body, query, notFoundMessage }: RequestOptions = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = accessTokenProvider();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    // Sin red, servidor caído, proxy sin destino o tiempo de espera agotado.
    throw new ServiceError("NETWORK", "No pudimos conectar con el servidor. Revisa tu conexión e intenta nuevamente.");
  }

  const payload = await readBody(response);

  if (!response.ok) {
    const errorBody = isObject(payload) && isObject(payload.error) ? payload.error : null;
    throw translateError(response.status, errorBody, notFoundMessage);
  }

  // 204 (sin contenido), p. ej. cierre de sesión.
  if (response.status === 204) return { data: null as T, meta: null };

  if (!isObject(payload) || payload.success !== true) {
    throw new ServiceError("UNKNOWN", "El servidor respondió con un formato inesperado. Intenta nuevamente.");
  }
  return { data: payload.data as T, meta: isObject(payload.meta) ? (payload.meta as unknown as PaginationMeta) : null };
}

type ReadOptions = Omit<RequestOptions, "body">;

export async function apiGet<T>(path: string, options: ReadOptions = {}): Promise<T> {
  return (await apiRequest<T>("GET", path, options)).data;
}

/**
 * GET de una colección completa. El backend pagina (20 por defecto, máximo 100): se pide la
 * primera página sin parámetros —así funciona también con rutas que no paginan— y, si `meta`
 * indica más páginas, se recorren con el mismo tamaño de página. Las pantallas filtran y
 * buscan en cliente, por lo que necesitan el conjunto completo.
 */
export async function apiGetAll<T>(path: string, options: ReadOptions = {}): Promise<T[]> {
  const first = await apiRequest<T[]>("GET", path, options);
  const items = [...first.data];
  const meta = first.meta;
  if (!meta) return items;

  const lastPage = Math.min(meta.totalPages, MAX_PAGES);
  for (let page = 2; page <= lastPage; page += 1) {
    const next = await apiRequest<T[]>("GET", path, {
      ...options,
      query: { ...options.query, page, limit: meta.limit },
    });
    items.push(...next.data);
  }
  return items;
}

export async function apiPost<T>(path: string, body?: unknown, options: ReadOptions = {}): Promise<T> {
  return (await apiRequest<T>("POST", path, { ...options, body })).data;
}

export async function apiPut<T>(path: string, body?: unknown, options: ReadOptions = {}): Promise<T> {
  return (await apiRequest<T>("PUT", path, { ...options, body })).data;
}

export async function apiPatch<T>(path: string, body?: unknown, options: ReadOptions = {}): Promise<T> {
  return (await apiRequest<T>("PATCH", path, { ...options, body })).data;
}

export async function apiDelete(path: string, options: ReadOptions = {}): Promise<void> {
  await apiRequest<null>("DELETE", path, options);
}
