import { API_MODE } from "@/lib/api/config";
import { activitiesHttpService } from "./activities.http-service";
import { activitiesMockService } from "./activities.mock-service";
import type { ActivitiesService } from "./types";

/**
 * Punto único de acceso al servicio de actividades y asistencia. Los hooks solo importan `activitiesService`.
 * `NEXT_PUBLIC_API_MODE=http` usa el backend; cualquier otro valor usa los datos simulados.
 */
export const activitiesService: ActivitiesService = API_MODE === "http" ? activitiesHttpService : activitiesMockService;
