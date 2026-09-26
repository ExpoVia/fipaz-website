import type { NextConfig } from "next";

/**
 * El backend (`fexpo-backend`) no habilita CORS, así que el navegador no puede llamarlo
 * directamente. Con `BACKEND_URL` definida, Next reenvía `/api/v1/*` al backend desde el
 * servidor y el navegador solo habla con su propio origen. Sin `BACKEND_URL` no se agrega
 * ninguna regla (modo demostración con datos simulados).
 */
const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) return [];
    return [{ source: "/api/v1/:path*", destination: `${backendUrl}/api/v1/:path*` }];
  },
};

export default nextConfig;
