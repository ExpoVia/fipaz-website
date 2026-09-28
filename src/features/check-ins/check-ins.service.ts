import { API_MODE } from "@/lib/api/config";
import { checkInsHttpService } from "./check-ins.http-service";
import { checkInsMockService } from "./check-ins.mock-service";
import type { CheckInsService } from "./types";

/**
 * Punto único de acceso al servicio de check-ins. Los hooks solo importan `checkInsService`.
 * `NEXT_PUBLIC_API_MODE=http` usa el backend; cualquier otro valor usa los datos simulados.
 */
export const checkInsService: CheckInsService = API_MODE === "http" ? checkInsHttpService : checkInsMockService;
