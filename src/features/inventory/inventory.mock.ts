import { ADMIN_DEFAULT_EVENT_ID } from "@/features/admin/admin-scope";
import type { Reward } from "@/features/rewards/types";
import { createMockCollection } from "@/lib/mock/mock-collection";
import { createMockId } from "@/lib/mock/mock-runtime";
import { normalizeText } from "@/lib/text";
import { computeNewOnHand } from "./adjustments";
import type { AdjustmentType, Inventory, InventoryAdjustment } from "./types";

export const MOCK_ADMIN_NAME = "Administrador demo";

interface SeedEntry {
  type: AdjustmentType;
  quantity: number;
  reason: string;
  note?: string;
  createdAt: string;
}

interface SeedInventory {
  id: string;
  eventId: string;
  rewardId: string;
  sku: string;
  reserved: number;
  delivered: number;
  /** Del más antiguo al más reciente. El stock físico actual es el resultado de aplicarlos. */
  history: SeedEntry[];
}

const FIPAZ = ADMIN_DEFAULT_EVENT_ID;

const SEEDS: SeedInventory[] = [
  {
    id: "inv-001",
    eventId: FIPAZ,
    rewardId: "rwd-001",
    sku: "EXV-MOC-001",
    reserved: 20,
    delivered: 35,
    history: [
      { type: "restock", quantity: 120, reason: "Ingreso inicial de stock", createdAt: "2026-09-07T08:30:00-04:00" },
      { type: "damage_loss", quantity: 8, reason: "Costura defectuosa", note: "Lote con fallas de fábrica, se devolvió al proveedor.", createdAt: "2026-09-08T11:10:00-04:00" },
      { type: "decrement", quantity: 12, reason: "Donación al equipo organizador", createdAt: "2026-09-09T09:45:00-04:00" },
    ],
  },
  {
    id: "inv-002",
    eventId: FIPAZ,
    rewardId: "rwd-002",
    sku: "EXV-TOM-002",
    reserved: 12,
    delivered: 60,
    history: [
      { type: "restock", quantity: 100, reason: "Ingreso inicial de stock", createdAt: "2026-09-07T08:35:00-04:00" },
      { type: "decrement", quantity: 20, reason: "Muestras para prensa", createdAt: "2026-09-08T16:20:00-04:00" },
    ],
  },
  {
    id: "inv-003",
    eventId: FIPAZ,
    rewardId: "rwd-003",
    sku: "EXV-VOU-003",
    reserved: 40,
    delivered: 95,
    history: [
      { type: "restock", quantity: 250, reason: "Ingreso inicial de stock", createdAt: "2026-09-07T08:40:00-04:00" },
      { type: "decrement", quantity: 50, reason: "Devolución al proveedor", note: "Vouchers con fecha de vencimiento anterior al evento.", createdAt: "2026-09-08T13:00:00-04:00" },
    ],
  },
  {
    id: "inv-004",
    eventId: FIPAZ,
    rewardId: "rwd-004",
    sku: "EXV-POS-004",
    reserved: 0,
    delivered: 30,
    history: [{ type: "restock", quantity: 60, reason: "Ingreso inicial de stock", createdAt: "2026-09-07T08:45:00-04:00" }],
  },
  {
    id: "inv-005",
    eventId: FIPAZ,
    rewardId: "rwd-005",
    sku: "EXV-ENT-005",
    reserved: 5,
    delivered: 10,
    history: [
      { type: "restock", quantity: 20, reason: "Ingreso inicial de stock", createdAt: "2026-09-07T08:50:00-04:00" },
      { type: "damage_loss", quantity: 3, reason: "Entradas extraviadas", createdAt: "2026-09-08T18:30:00-04:00" },
      { type: "decrement", quantity: 5, reason: "Cortesía a invitados", createdAt: "2026-09-09T10:15:00-04:00" },
    ],
  },
  {
    id: "inv-006",
    eventId: FIPAZ,
    rewardId: "rwd-006",
    sku: "EXV-INS-006",
    reserved: 0,
    delivered: 150,
    history: [
      { type: "restock", quantity: 150, reason: "Cupo inicial de insignias", createdAt: "2026-09-07T08:55:00-04:00" },
      { type: "decrement", quantity: 150, reason: "Cupo agotado", note: "Se entregaron todas las insignias digitales del primer lote.", createdAt: "2026-09-09T17:00:00-04:00" },
    ],
  },
  {
    id: "inv-007",
    eventId: "event-expocruz",
    rewardId: "rwd-007",
    sku: "EXV-BOL-007",
    reserved: 25,
    delivered: 40,
    history: [{ type: "restock", quantity: 300, reason: "Ingreso inicial de stock", createdAt: "2026-09-06T09:00:00-04:00" }],
  },
];

function buildHistory(seed: SeedInventory): InventoryAdjustment[] {
  let onHand = 0;
  return seed.history.map((entry, index) => {
    const previousOnHand = onHand;
    onHand = computeNewOnHand(previousOnHand, entry.type, entry.quantity);
    return {
      id: `${seed.id}-adj-${index + 1}`,
      inventoryId: seed.id,
      type: entry.type,
      quantity: entry.quantity,
      delta: onHand - previousOnHand,
      previousOnHand,
      newOnHand: onHand,
      reason: entry.reason,
      note: entry.note,
      createdBy: MOCK_ADMIN_NAME,
      createdAt: entry.createdAt,
    };
  });
}

function createInventorySeed(): Inventory[] {
  return SEEDS.map((seed) => {
    const history = buildHistory(seed);
    const last = history[history.length - 1];
    return {
      id: seed.id,
      eventId: seed.eventId,
      rewardId: seed.rewardId,
      sku: seed.sku,
      onHand: last.newOnHand,
      reserved: seed.reserved,
      available: last.newOnHand - seed.reserved,
      delivered: seed.delivered,
      updatedAt: last.createdAt,
    };
  });
}

function createAdjustmentsSeed(): InventoryAdjustment[] {
  return SEEDS.flatMap(buildHistory);
}

export const inventoryStore = createMockCollection<Inventory>("inventory", createInventorySeed);
export const adjustmentsStore = createMockCollection<InventoryAdjustment>(
  "inventory-adjustments",
  createAdjustmentsSeed,
);

/** "Mochila ExpoVia" → "EXV-MOC-008": prefijo, tres letras del nombre y correlativo único. */
function createSku(rewardName: string): string {
  const letters = normalizeText(rewardName).replace(/[^a-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  const taken = new Set(inventoryStore.all().map((inventory) => inventory.sku));
  let sequence = inventoryStore.all().length + 1;
  let sku = "";
  do {
    sku = `EXV-${letters}-${String(sequence).padStart(3, "0")}`;
    sequence += 1;
  } while (taken.has(sku));
  return sku;
}

/*
 * Los dos helpers siguientes reemplazan lo que en producción haría el backend al crear o
 * borrar un premio (crear su registro de inventario y limpiar su historial). Solo los usa
 * `rewards.service.ts` y desaparecen con los mocks.
 */

export function provisionInventoryForReward(
  reward: Pick<Reward, "id" | "eventId" | "name">,
  initialStock: number,
): Inventory {
  const now = new Date().toISOString();
  const inventory = inventoryStore.insert({
    id: createMockId("inv"),
    eventId: reward.eventId,
    rewardId: reward.id,
    sku: createSku(reward.name),
    onHand: initialStock,
    reserved: 0,
    available: initialStock,
    delivered: 0,
    updatedAt: now,
  });

  if (initialStock > 0) {
    adjustmentsStore.insert({
      id: createMockId("adj"),
      inventoryId: inventory.id,
      type: "restock",
      quantity: initialStock,
      delta: initialStock,
      previousOnHand: 0,
      newOnHand: initialStock,
      reason: "Stock inicial",
      createdBy: MOCK_ADMIN_NAME,
      createdAt: now,
    });
  }
  return inventory;
}

export function dropInventoryForReward(rewardId: string): void {
  const inventory = inventoryStore.all().find((item) => item.rewardId === rewardId);
  if (!inventory) return;
  inventoryStore.remove(inventory.id);
  adjustmentsStore.removeWhere((adjustment) => adjustment.inventoryId === inventory.id);
}
