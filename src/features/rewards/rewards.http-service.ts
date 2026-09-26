import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiDelete, apiGet, apiGetAll, apiPatch, apiPost, apiPut } from "@/lib/api/http-client";
import type { RewardsService, RewardWithStock } from "./types";

/**
 * Servicio de premios contra el backend (`NEXT_PUBLIC_API_MODE=http`).
 *
 * `GET /events/:eventId/rewards` debe traer cada premio con su resumen de stock (`stock`), y
 * `POST` acepta `initialStock` y crea el inventario junto con el premio (ver
 * `features/admin/README.md`). `eventId` va en la URL, no en el cuerpo (`forbidNonWhitelisted`).
 */

const NOT_FOUND = "No encontramos el premio solicitado.";
const EVENT_NOT_FOUND = "No encontramos el evento solicitado.";

export const rewardsHttpService: RewardsService = {
  getRewardsByEvent(eventId) {
    return apiGetAll<RewardWithStock>(API_ENDPOINTS.rewards.byEvent(eventId), { notFoundMessage: EVENT_NOT_FOUND });
  },

  getRewardById(rewardId) {
    return apiGet<RewardWithStock>(API_ENDPOINTS.rewards.byId(rewardId), { notFoundMessage: NOT_FOUND });
  },

  createReward({ eventId, ...fields }) {
    return apiPost<RewardWithStock>(API_ENDPOINTS.rewards.byEvent(eventId), fields, {
      notFoundMessage: EVENT_NOT_FOUND,
    });
  },

  updateReward(rewardId, data) {
    return apiPut<RewardWithStock>(API_ENDPOINTS.rewards.byId(rewardId), data, { notFoundMessage: NOT_FOUND });
  },

  deleteReward(rewardId) {
    return apiDelete(API_ENDPOINTS.rewards.byId(rewardId), { notFoundMessage: NOT_FOUND });
  },

  /** Lee el estado vigente y envía el contrario: `PATCH …/status` recibe el estado destino. */
  async toggleRewardStatus(rewardId) {
    const current = await apiGet<RewardWithStock>(API_ENDPOINTS.rewards.byId(rewardId), { notFoundMessage: NOT_FOUND });
    return apiPatch<RewardWithStock>(
      API_ENDPOINTS.rewards.status(rewardId),
      { status: current.status === "active" ? "inactive" : "active" },
      { notFoundMessage: NOT_FOUND },
    );
  },
};
