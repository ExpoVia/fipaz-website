import type { RewardStatus } from "@/features/rewards/types";

export type AdjustmentType = "increment" | "decrement" | "correction" | "restock" | "damage_loss";

/**
 * Existencias de un premio. Relación entre las cantidades:
 *
 *   disponible = stock físico (onHand) − reservado
 *
 * `delivered` es un acumulado histórico: esas unidades ya salieron del stock físico.
 */
export interface Inventory {
  id: string;
  eventId: string;
  rewardId: string;
  sku: string;
  /** Unidades físicamente en almacén (incluye las reservadas). */
  onHand: number;
  /** Unidades apartadas para canjes pendientes de entrega. */
  reserved: number;
  /** Unidades que se pueden seguir canjeando (onHand − reserved). */
  available: number;
  /** Unidades ya entregadas a visitantes (acumulado). */
  delivered: number;
  /** ISO 8601 */
  updatedAt: string;
}

/** Cantidades de un inventario, sin datos del premio. */
export type StockTotals = Pick<Inventory, "onHand" | "reserved" | "available" | "delivered">;

/** Inventario con los datos del premio necesarios para listarlo. */
export interface InventoryItem extends Inventory {
  rewardName: string;
  rewardImageUrl?: string;
  rewardStatus: RewardStatus;
}

export interface InventoryAdjustment {
  id: string;
  inventoryId: string;
  type: AdjustmentType;
  /** Cantidad ingresada por el usuario (siempre positiva). */
  quantity: number;
  /** Efecto neto sobre el stock físico (negativo si resta). */
  delta: number;
  previousOnHand: number;
  newOnHand: number;
  reason: string;
  note?: string;
  createdBy: string;
  /** ISO 8601 */
  createdAt: string;
}

/** Datos que envía el formulario de ajuste. */
export interface AdjustmentInput {
  type: AdjustmentType;
  quantity: number;
  reason: string;
  note?: string;
}

export interface AdjustmentResult {
  inventory: InventoryItem;
  adjustment: InventoryAdjustment;
}

export type StockLevel = "ok" | "low" | "out";

/**
 * Contrato del servicio. Lo implementan `inventory.mock-service.ts` (datos simulados) y
 * `inventory.http-service.ts` (backend); ambas respetan estas firmas.
 */
export interface InventoryService {
  /** GET /events/:eventId/inventory */
  getInventoryByEvent(eventId: string): Promise<InventoryItem[]>;
  /** GET /inventory/:inventoryId */
  getInventoryById(inventoryId: string): Promise<InventoryItem>;
  /** POST /inventory/:inventoryId/adjustments */
  createAdjustment(inventoryId: string, data: AdjustmentInput): Promise<AdjustmentResult>;
  /** GET /inventory/:inventoryId/adjustments */
  getInventoryHistory(inventoryId: string): Promise<InventoryAdjustment[]>;
}
