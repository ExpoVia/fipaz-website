import type { NextConfig } from "next";

/**
 * El backend (`fexpo-backend`) no habilita CORS, así que el navegador no puede llamarlo
 * directamente. Next reenvía `/api/v1/*` al backend desde el servidor y el navegador solo
 * habla con su propio origen. `BACKEND_URL` es la configuración recomendada; se conserva
 * `NEXT_PUBLIC_AGENT_BACKEND_URL` como alternativa durante la transición de entornos locales.
 */
const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL)?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) return [];
    return [{ source: "/api/v1/:path*", destination: `${backendUrl}/api/v1/:path*` }];
  },
};

export default nextConfig;
