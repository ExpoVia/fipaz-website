import { API_MODE } from "@/lib/api/config";
import { rewardsHttpService } from "./rewards.http-service";
import { rewardsMockService } from "./rewards.mock-service";
import type { RewardsService } from "./types";

/**
 * Punto único de acceso al servicio de premios. Los hooks solo importan `rewardsService`.
 * `NEXT_PUBLIC_API_MODE=http` usa el backend; cualquier otro valor usa los datos simulados.
 */
export const rewardsService: RewardsService = API_MODE === "http" ? rewardsHttpService : rewardsMockService;
