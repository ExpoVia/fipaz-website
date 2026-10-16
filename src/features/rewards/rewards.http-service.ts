import { fromReward, toReward, type BackendReward } from "@/features/admin/backend-adapters";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiDelete, apiGet, apiGetAll, apiPatch, apiPost } from "@/lib/api/http-client";
import { ServiceError } from "@/lib/api/service-error";
import type { RewardsService } from "./types";

const NOT_FOUND = "No encontramos el premio solicitado.";
const EVENT_NOT_FOUND = "No encontramos el evento solicitado.";
const eventByReward = new Map<string, string>();

function eventFor(rewardId: string): string {
  const eventId = eventByReward.get(rewardId);
  if (!eventId) throw new ServiceError("NOT_FOUND", "Abre primero el catálogo del evento para consultar este premio.");
  return eventId;
}

export const rewardsHttpService: RewardsService = {
  async getRewardsByEvent(eventId) {
    const rows = await apiGetAll<BackendReward>(API_ENDPOINTS.rewards.byEvent(eventId), { notFoundMessage: EVENT_NOT_FOUND });
    for (const row of rows) eventByReward.set(row.id, eventId);
    return rows.map(fromReward);
  },
  async getRewardById(rewardId) {
    const eventId = eventFor(rewardId);
    return fromReward(await apiGet<BackendReward>(API_ENDPOINTS.rewards.byId(eventId, rewardId), { notFoundMessage: NOT_FOUND }));
  },
  async createReward({ eventId, initialStock, ...fields }) {
    const raw = await apiPost<BackendReward>(API_ENDPOINTS.rewards.byEvent(eventId), { ...toReward(fields), initialStock: initialStock ?? 0 }, { notFoundMessage: EVENT_NOT_FOUND });
    eventByReward.set(raw.id, eventId);
    return fromReward(raw);
  },
  async updateReward(rewardId, data) {
    const eventId = eventFor(rewardId);
    await apiPatch<BackendReward>(API_ENDPOINTS.rewards.byId(eventId, rewardId), toReward(data), { notFoundMessage: NOT_FOUND });
    return this.getRewardById(rewardId);
  },
  async deleteReward(rewardId) {
    const eventId = eventFor(rewardId);
    await apiDelete(API_ENDPOINTS.rewards.byId(eventId, rewardId), { notFoundMessage: NOT_FOUND });
    eventByReward.delete(rewardId);
  },
  async toggleRewardStatus(rewardId) {
    const eventId = eventFor(rewardId);
    const current = await apiGet<BackendReward>(API_ENDPOINTS.rewards.byId(eventId, rewardId), { notFoundMessage: NOT_FOUND });
    await apiPatch<BackendReward>(API_ENDPOINTS.rewards.byId(eventId, rewardId), { isActive: !current.isActive }, { notFoundMessage: NOT_FOUND });
    return this.getRewardById(rewardId);
  },
};
