/**
 * Configuración del origen de datos del módulo administrativo.
 *
 * - `mock` (por defecto): los servicios trabajan con datos simulados; no hace falta backend.
 * - `http`: los servicios llaman al backend (`fexpo-backend`).
 *
 * Las variables `NEXT_PUBLIC_*` se incrustan en el bundle en tiempo de compilación, por lo que
 * hay que reiniciar `next dev` al cambiarlas. Deben leerse con el nombre literal.
 */
export type ApiMode = "mock" | "http";

export const API_MODE: ApiMode = process.env.NEXT_PUBLIC_API_MODE === "http" ? "http" : "mock";

const API_PREFIX = "/api/v1";
const DEFAULT_BACKEND_URL = "http://localhost:3000";

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * URL base de la API según dónde corra el código.
 *
 * - Navegador: ruta relativa (`/api/v1`). El backend no habilita CORS, así que el navegador solo
 *   puede llegar a él a través del proxy de Next (`rewrites` en `next.config.ts`, activo cuando
 *   existe `BACKEND_URL`). Si el backend habilitara CORS, `NEXT_PUBLIC_API_BASE_URL` permite
 *   apuntar directo a su URL completa.
 * - Servidor (Server Components): no hay origen de navegador, se llama directo al backend.
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return `${stripTrailingSlashes(process.env.BACKEND_URL ?? DEFAULT_BACKEND_URL)}${API_PREFIX}`;
  }
  return stripTrailingSlashes(process.env.NEXT_PUBLIC_API_BASE_URL ?? API_PREFIX);
}
