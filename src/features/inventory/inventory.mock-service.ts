import { rewardsStore } from "@/features/rewards/rewards.mock";
import { ServiceError } from "@/lib/api/service-error";
import { createMockId, mockRequest, sortNewestFirst } from "@/lib/mock/mock-runtime";
import { computeNewOnHand, getAdjustmentBlocker } from "./adjustments";
import { adjustmentsStore, inventoryStore, MOCK_ADMIN_NAME } from "./inventory.mock";
import type { Inventory, InventoryItem, InventoryService } from "./types";

/**
 * Servicio SIMULADO de inventario (`NEXT_PUBLIC_API_MODE=mock`, el valor por defecto).
 *
 * Trabaja sobre `inventoryStore` y `adjustmentsStore`. Aplica las mismas reglas que el
 * formulario (`adjustments.ts`) porque el backend real tampoco debe confiar en la validación
 * del cliente. La implementación contra el backend está en `inventory.http-service.ts`;
 * `inventory.service.ts` elige cuál se usa.
 */

function requireInventory(inventoryId: string): Inventory {
  const inventory = inventoryStore.find(inventoryId);
  if (!inventory) throw new ServiceError("NOT_FOUND", "No encontramos el inventario solicitado.");
  return inventory;
}

/** Une los datos del premio, como lo entregaría el backend en la misma respuesta. */
function toItem(inventory: Inventory): InventoryItem {
  const reward = rewardsStore.find(inventory.rewardId);
  return {
    ...inventory,
    rewardName: reward?.name ?? "Premio eliminado",
    rewardImageUrl: reward?.imageUrl,
    rewardStatus: reward?.status ?? "inactive",
  };
}

export const inventoryMockService: InventoryService = {
  // GET /events/:eventId/inventory
  getInventoryByEvent(eventId) {
    return mockRequest(() =>
      inventoryStore
        .all()
        .filter((inventory) => inventory.eventId === eventId)
        .map(toItem)
        .sort((a, b) => a.rewardName.localeCompare(b.rewardName, "es")),
    );
  },

  // GET /inventory/:inventoryId
  getInventoryById(inventoryId) {
    return mockRequest(() => toItem(requireInventory(inventoryId)));
  },

  // POST /inventory/:inventoryId/adjustments
  createAdjustment(inventoryId, data) {
    return mockRequest(() => {
      const inventory = requireInventory(inventoryId);

      const blocker = getAdjustmentBlocker(inventory, data.type, data.quantity);
      if (blocker) throw new ServiceError("VALIDATION", blocker);

      const now = new Date().toISOString();
      const newOnHand = computeNewOnHand(inventory.onHand, data.type, data.quantity);
      const adjustment = adjustmentsStore.insert({
        id: createMockId("adj"),
        inventoryId,
        type: data.type,
        quantity: data.quantity,
        delta: newOnHand - inventory.onHand,
        previousOnHand: inventory.onHand,
        newOnHand,
        reason: data.reason,
        note: data.note,
        createdBy: MOCK_ADMIN_NAME,
        createdAt: now,
      });
      const updated = inventoryStore.patch(inventoryId, {
        onHand: newOnHand,
        available: newOnHand - inventory.reserved,
        updatedAt: now,
      }) as Inventory;

      return { inventory: toItem(updated), adjustment };
    });
  },

  // GET /inventory/:inventoryId/adjustments
  getInventoryHistory(inventoryId) {
    return mockRequest(() => {
      requireInventory(inventoryId);
      return sortNewestFirst(adjustmentsStore.all().filter((adjustment) => adjustment.inventoryId === inventoryId));
    });
  },
};
