"use client";

import { useCallback } from "react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { inventoryService } from "../inventory.service";
import type { AdjustmentInput } from "../types";

/** Inventario de todos los premios de un evento y el registro de ajustes de stock. */
export function useInventory(eventId: string) {
  const { data, status, reload, setData } = useAsyncResource(`inventory:${eventId}`, () =>
    inventoryService.getInventoryByEvent(eventId),
  );

  const adjust = useCallback(
    async (inventoryId: string, input: AdjustmentInput) => {
      const result = await inventoryService.createAdjustment(inventoryId, input);
      setData((list) => list.map((item) => (item.id === inventoryId ? result.inventory : item)));
      return result;
    },
    [setData],
  );

  return { inventory: data ?? [], status, reload, adjust };
}

/** Detalle de un inventario junto con su historial de ajustes (más recientes primero). */
export function useInventoryDetail(inventoryId: string) {
  return useAsyncResource(`inventory-detail:${inventoryId}`, async () => {
    const [inventory, history] = await Promise.all([
      inventoryService.getInventoryById(inventoryId),
      inventoryService.getInventoryHistory(inventoryId),
    ]);
    return { inventory, history };
  });
}
