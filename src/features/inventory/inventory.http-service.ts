import { fromInventory, type BackendInventory } from "@/features/admin/backend-adapters";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiGet, apiGetAll, apiPost } from "@/lib/api/http-client";
import { ServiceError } from "@/lib/api/service-error";
import { computeNewOnHand, getAdjustmentBlocker } from "./adjustments";
import type { AdjustmentResult, InventoryAdjustment, InventoryService } from "./types";

interface BackendMovement {
  id: string;
  inventoryId: string;
  movementType: string;
  onHandDelta: number;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

const NOT_FOUND = "No encontramos el inventario solicitado.";
const EVENT_NOT_FOUND = "No encontramos el evento solicitado.";
const eventByInventory = new Map<string, string>();

function eventFor(inventoryId: string): string {
  const eventId = eventByInventory.get(inventoryId);
  if (!eventId) throw new ServiceError("NOT_FOUND", "Abre primero el inventario del evento para consultar este registro.");
  return eventId;
}

export const inventoryHttpService: InventoryService = {
  async getInventoryByEvent(eventId) {
    const rows = await apiGetAll<BackendInventory>(API_ENDPOINTS.inventory.byEvent(eventId), { notFoundMessage: EVENT_NOT_FOUND });
    for (const row of rows) eventByInventory.set(row.id, eventId);
    return rows.map(fromInventory);
  },
  async getInventoryById(inventoryId) {
    const eventId = eventFor(inventoryId);
    return fromInventory(await apiGet<BackendInventory>(API_ENDPOINTS.inventory.byId(eventId, inventoryId), { notFoundMessage: NOT_FOUND }));
  },
  async createAdjustment(inventoryId, data): Promise<AdjustmentResult> {
    const eventId = eventFor(inventoryId);
    const current = await this.getInventoryById(inventoryId);
    const blocker = getAdjustmentBlocker(current, data.type, data.quantity);
    if (blocker) throw new ServiceError("VALIDATION", blocker);
    const nextOnHand = computeNewOnHand(current.onHand, data.type, data.quantity);
    const delta = nextOnHand - current.onHand;
    if (delta === 0) throw new ServiceError("VALIDATION", "El ajuste no cambia las existencias.");
    const note = [data.reason, data.note].filter(Boolean).join(" · ");
    const movement = await apiPost<BackendMovement>(API_ENDPOINTS.inventory.adjustments(eventId, inventoryId), { onHandDelta: delta, note }, { notFoundMessage: NOT_FOUND });
    const inventory = await this.getInventoryById(inventoryId);
    return {
      inventory,
      adjustment: {
        id: movement.id, inventoryId, type: data.type, quantity: data.quantity, delta,
        previousOnHand: current.onHand, newOnHand: inventory.onHand,
        reason: data.reason, note: data.note, createdBy: movement.createdBy ?? "Sistema", createdAt: movement.createdAt,
      },
    };
  },
  async getInventoryHistory(inventoryId): Promise<InventoryAdjustment[]> {
    const eventId = eventFor(inventoryId);
    const [current, movements] = await Promise.all([
      this.getInventoryById(inventoryId),
      apiGetAll<BackendMovement>(API_ENDPOINTS.inventory.adjustments(eventId, inventoryId), { notFoundMessage: NOT_FOUND }),
    ]);
    let onHand = current.onHand;
    const history: InventoryAdjustment[] = [];
    for (const movement of movements) {
      const newOnHand = onHand;
      onHand -= movement.onHandDelta;
      if (movement.movementType !== "restock" && movement.movementType !== "adjustment") continue;
      history.push({
        id: movement.id, inventoryId, type: movement.movementType === "restock" ? "restock" : movement.onHandDelta > 0 ? "increment" : "decrement",
        quantity: Math.abs(movement.onHandDelta), delta: movement.onHandDelta,
        previousOnHand: onHand, newOnHand,
        reason: movement.note ?? "Ajuste de inventario", createdBy: movement.createdBy ?? "Sistema", createdAt: movement.createdAt,
      });
    }
    return history;
  },
};
