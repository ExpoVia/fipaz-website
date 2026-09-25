"use client";

import { useCallback } from "react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { activitiesService } from "../activities.service";
import type { Activity, ActivityInput } from "../types";

/**
 * Actividades de un stand y sus mutaciones. Cada mutación exitosa actualiza la lista local
 * con la entidad que devolvió el servicio; si falla, lanza para que la UI muestre el error.
 */
export function useActivities(standId: string) {
  const { data, status, reload, setData } = useAsyncResource(`activities:${standId}`, () =>
    activitiesService.getActivitiesByStand(standId),
  );

  const replace = useCallback(
    (updated: Activity) =>
      setData((list) => list.map((item) => (item.id === updated.id ? updated : item))),
    [setData],
  );

  const create = useCallback(
    async (input: ActivityInput) => {
      const created = await activitiesService.createActivity({ ...input, standId });
      setData((list) => [...list, created]);
      return created;
    },
    [standId, setData],
  );

  const update = useCallback(
    async (activityId: string, input: ActivityInput) => {
      const updated = await activitiesService.updateActivity(activityId, input);
      replace(updated);
      return updated;
    },
    [replace],
  );

  const cancel = useCallback(
    async (activityId: string) => {
      const cancelled = await activitiesService.cancelActivity(activityId);
      replace(cancelled);
      return cancelled;
    },
    [replace],
  );

  return { activities: data ?? [], status, reload, create, update, cancel };
}
