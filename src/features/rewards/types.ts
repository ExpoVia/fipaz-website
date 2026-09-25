import type { StockTotals } from "@/features/inventory/types";

export type RewardType = "merch" | "voucher" | "badge" | "product" | "experience" | "other";

export type RewardStatus = "active" | "inactive";

export interface Reward {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  type: RewardType;
  costPoints: number;
  /** Ruta de una imagen del catálogo; sin ella la UI muestra un placeholder. */
  imageUrl?: string;
  status: RewardStatus;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** Existencias asociadas a un premio, tal como las resume el catálogo. */
export interface RewardStock extends StockTotals {
  inventoryId: string;
}

/** Premio con su resumen de stock (el backend lo entrega junto en `GET /events/:eventId/rewards`). */
export interface RewardWithStock extends Reward {
  stock: RewardStock | null;
}

/** Datos editables de un premio (lo que envía el formulario). */
export interface RewardInput {
  name: string;
  description?: string;
  type: RewardType;
  costPoints: number;
  imageUrl?: string;
  status: RewardStatus;
  /** Solo al crear. Después el stock se gestiona con ajustes de inventario. */
  initialStock?: number;
}

export interface CreateRewardInput extends RewardInput {
  eventId: string;
}

export type UpdateRewardInput = Omit<RewardInput, "initialStock">;

/**
 * Contrato del servicio. La implementación actual es simulada; la HTTP futura debe
 * respetar estas firmas.
 */
export interface RewardsService {
  /** GET /events/:eventId/rewards */
  getRewardsByEvent(eventId: string): Promise<RewardWithStock[]>;
  /** GET /rewards/:rewardId */
  getRewardById(rewardId: string): Promise<RewardWithStock>;
  /** POST /events/:eventId/rewards */
  createReward(data: CreateRewardInput): Promise<RewardWithStock>;
  /** PUT /rewards/:rewardId */
  updateReward(rewardId: string, data: UpdateRewardInput): Promise<RewardWithStock>;
  /** DELETE /rewards/:rewardId */
  deleteReward(rewardId: string): Promise<void>;
  /** PATCH /rewards/:rewardId/status (propuesta) */
  toggleRewardStatus(rewardId: string): Promise<RewardWithStock>;
}
