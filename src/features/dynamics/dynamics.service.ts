import { API_MODE } from "@/lib/api/config";
import { dynamicsHttpService } from "./dynamics.http-service";
import { dynamicsMockService } from "./dynamics.mock-service";
import type { DynamicsService } from "./types";

/**
 * Punto único de acceso al servicio de dinámicas. Los hooks solo importan `dynamicsService`.
 * `NEXT_PUBLIC_API_MODE=http` usa el backend; cualquier otro valor usa los datos simulados.
 */
export const dynamicsService: DynamicsService = API_MODE === "http" ? dynamicsHttpService : dynamicsMockService;
