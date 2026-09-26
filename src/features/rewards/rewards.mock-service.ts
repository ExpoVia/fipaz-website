import { dropInventoryForReward, inventoryStore, provisionInventoryForReward } from "@/features/inventory/inventory.mock";
import { ServiceError } from "@/lib/api/service-error";
import { createMockId, mockRequest, sortNewestFirst } from "@/lib/mock/mock-runtime";
import { rewardsStore } from "./rewards.mock";
import type { Reward, RewardsService, RewardWithStock } from "./types";

/**
 * Servicio SIMULADO de premios (`NEXT_PUBLIC_API_MODE=mock`, el valor por defecto).
 *
 * Trabaja sobre `rewardsStore` (memoria + sessionStorage). El resumen de stock de cada premio
 * se une aquí desde el inventario, igual que lo entregaría el backend en la misma respuesta.
 * La implementación contra el backend está en `rewards.http-service.ts`; `rewards.service.ts`
 * elige cuál se usa.
 */

function requireReward(rewardId: string): Reward {
  const reward = rewardsStore.find(rewardId);
  if (!reward) throw new ServiceError("NOT_FOUND", "No encontramos el premio solicitado.");
  return reward;
}

function withStock(reward: Reward): RewardWithStock {
  const inventory = inventoryStore.all().find((item) => item.rewardId === reward.id);
  return {
    ...reward,
    stock: inventory
      ? {
          inventoryId: inventory.id,
          onHand: inventory.onHand,
          reserved: inventory.reserved,
          available: inventory.available,
          delivered: inventory.delivered,
        }
      : null,
  };
}

export const rewardsMockService: RewardsService = {
  // GET /events/:eventId/rewards
  getRewardsByEvent(eventId) {
    return mockRequest(() =>
      sortNewestFirst(rewardsStore.all().filter((reward) => reward.eventId === eventId)).map(withStock),
    );
  },

  // GET /rewards/:rewardId
  getRewardById(rewardId) {
    return mockRequest(() => withStock(requireReward(rewardId)));
  },

  // POST /events/:eventId/rewards
  createReward({ eventId, initialStock, ...fields }) {
    return mockRequest(() => {
      const now = new Date().toISOString();
      const reward = rewardsStore.insert({
        id: createMockId("rwd"),
        eventId,
        ...fields,
        createdAt: now,
        updatedAt: now,
      });
      // El backend real crea el registro de inventario junto con el premio.
      provisionInventoryForReward(reward, initialStock ?? 0);
      return withStock(reward);
    });
  },

  // PUT /rewards/:rewardId
  updateReward(rewardId, data) {
    return mockRequest(() => {
      requireReward(rewardId);
      const updated = rewardsStore.patch(rewardId, { ...data, updatedAt: new Date().toISOString() }) as Reward;
      return withStock(updated);
    });
  },

  // DELETE /rewards/:rewardId
  deleteReward(rewardId) {
    return mockRequest(() => {
      requireReward(rewardId);
      rewardsStore.remove(rewardId);
      dropInventoryForReward(rewardId);
    });
  },

  // PATCH /rewards/:rewardId/status
  toggleRewardStatus(rewardId) {
    return mockRequest(() => {
      const current = requireReward(rewardId);
      const updated = rewardsStore.patch(rewardId, {
        status: current.status === "active" ? "inactive" : "active",
        updatedAt: new Date().toISOString(),
      }) as Reward;
      return withStock(updated);
    });
  },
};
