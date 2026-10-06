import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiGet, type BackendHealthResponseDto } from "@/lib/api/http-client";

/** Comprueba el proceso del backend y su conexión PostgreSQL (requiere respuesta database: up). */
export function getBackendHealth(): Promise<BackendHealthResponseDto> {
  return apiGet<BackendHealthResponseDto>(API_ENDPOINTS.health);
}
