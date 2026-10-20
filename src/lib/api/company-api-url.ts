/**
 * URL de un endpoint del backend para las llamadas de sesión y de empresa (siempre desde el navegador).
 *
 * - Con `NEXT_PUBLIC_AGENT_BACKEND_URL` se llama directo a esa URL. El backend tiene que permitir
 *   el origen del sitio (CORS).
 * - Sin ella se usa la ruta relativa `/api/v1`, que Next reenvía al backend gracias a `BACKEND_URL`
 *   (ver `rewrites` en `next.config.ts`). El navegador solo habla con su propio origen, sin CORS.
 */
export function companyApiUrl(path: string): string {
  const directUrl = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL?.trim().replace(/\/+$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${directUrl}/api/v1${normalizedPath}`;
}
