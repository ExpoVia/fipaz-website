"use client";

import { useCallback } from "react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { dynamicsService } from "../dynamics.service";
import type { Dynamic, DynamicInput } from "../types";

/**
 * Lista de dinámicas de un stand y sus mutaciones. Cada mutación exitosa actualiza la lista
 * local con la entidad que devolvió el servicio; si falla, lanza para que la UI muestre el error.
 */
export function useDynamics(standId: string) {
  const { data, status, reload, setData } = useAsyncResource(`dynamics:${standId}`, () =>
    dynamicsService.getDynamicsByStand(standId),
  );

  const replace = useCallback(
    (updated: Dynamic) =>
      setData((list) => list.map((item) => (item.id === updated.id ? updated : item))),
    [setData],
  );

  const create = useCallback(
    async (input: DynamicInput) => {
      const created = await dynamicsService.createDynamic({ ...input, standId });
      setData((list) => [created, ...list]);
      return created;
    },
    [standId, setData],
  );

  const update = useCallback(
    async (dynamicId: string, input: DynamicInput) => {
      const updated = await dynamicsService.updateDynamic(dynamicId, input);
      replace(updated);
      return updated;
    },
    [replace],
  );

  const toggleStatus = useCallback(
    async (dynamicId: string) => {
      const updated = await dynamicsService.toggleDynamicStatus(dynamicId);
      replace(updated);
      return updated;
    },
    [replace],
  );

  const remove = useCallback(
    async (dynamicId: string) => {
      await dynamicsService.deleteDynamic(dynamicId);
      setData((list) => list.filter((item) => item.id !== dynamicId));
    },
    [setData],
  );

  return { dynamics: data ?? [], status, reload, create, update, toggleStatus, remove };
}
