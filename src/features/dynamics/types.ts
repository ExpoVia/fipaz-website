export type DynamicType =
  | "trivia"
  | "game"
  | "qr_scan"
  | "registration"
  | "survey"
  | "activity"
  | "custom";

export type DynamicStatus = "active" | "inactive";

export interface Dynamic {
  id: string;
  standId: string;
  name: string;
  description?: string;
  type: DynamicType;
  points: number;
  status: DynamicStatus;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** Datos editables de una dinámica (lo que envía el formulario). */
export interface DynamicInput {
  name: string;
  description?: string;
  type: DynamicType;
  points: number;
  status: DynamicStatus;
}

export interface CreateDynamicInput extends DynamicInput {
  standId: string;
}

/**
 * Contrato del servicio. Lo implementan `dynamics.mock-service.ts` (datos simulados) y
 * `dynamics.http-service.ts` (backend); ambas respetan exactamente estas firmas.
 */
export interface DynamicsService {
  /** GET /stands/:standId/dynamics */
  getDynamicsByStand(standId: string): Promise<Dynamic[]>;
  /** GET /dynamics/:dynamicId (propuesta; hoy la lista ya trae el detalle) */
  getDynamicById(dynamicId: string): Promise<Dynamic>;
  /** POST /stands/:standId/dynamics */
  createDynamic(data: CreateDynamicInput): Promise<Dynamic>;
  /** PUT /dynamics/:dynamicId */
  updateDynamic(dynamicId: string, data: DynamicInput): Promise<Dynamic>;
  /** DELETE /dynamics/:dynamicId */
  deleteDynamic(dynamicId: string): Promise<void>;
  /** PATCH /dynamics/:dynamicId/status */
  toggleDynamicStatus(dynamicId: string): Promise<Dynamic>;
}
