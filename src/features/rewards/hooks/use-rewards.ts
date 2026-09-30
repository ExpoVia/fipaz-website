"use client";

import { useCallback } from "react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { rewardsService } from "../rewards.service";
import type { RewardInput, RewardWithStock, UpdateRewardInput } from "../types";

/**
 * Catálogo de premios de un evento y sus mutaciones. Cada mutación exitosa actualiza la lista
 * local con la entidad que devolvió el servicio; si falla, lanza para que la UI muestre el error.
 */
export function useRewards(eventId: string) {
  const { data, status, error, reload, setData } = useAsyncResource(`rewards:${eventId}`, () =>
    rewardsService.getRewardsByEvent(eventId),
  );

  const replace = useCallback(
    (updated: RewardWithStock) =>
      setData((list) => list.map((item) => (item.id === updated.id ? updated : item))),
    [setData],
  );

  const create = useCallback(
    async (input: RewardInput) => {
      const created = await rewardsService.createReward({ ...input, eventId });
      setData((list) => [created, ...list]);
      return created;
    },
    [eventId, setData],
  );

  const update = useCallback(
    async (rewardId: string, input: UpdateRewardInput) => {
      const updated = await rewardsService.updateReward(rewardId, input);
      replace(updated);
      return updated;
    },
    [replace],
  );

  const toggleStatus = useCallback(
    async (rewardId: string) => {
      const updated = await rewardsService.toggleRewardStatus(rewardId);
      replace(updated);
      return updated;
    },
    [replace],
  );

  const remove = useCallback(
    async (rewardId: string) => {
      await rewardsService.deleteReward(rewardId);
      setData((list) => list.filter((item) => item.id !== rewardId));
    },
    [setData],
  );

  return { rewards: data ?? [], status, error, reload, create, update, toggleStatus, remove };
}
