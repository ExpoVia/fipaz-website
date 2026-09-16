// Config del panel publica el contrato de rol; se reexporta para evitar una
// segunda unión que pueda divergir (mismo criterio que src/types/demo.ts con DemoTab).
import type { PanelRole } from "@/config/panel-navigation";
import type { Stand } from "@/types/demo";

export type { PanelRole };

/** Alias semántico: en el panel, un Stand es el perfil de una empresa expositora. */
export type ExhibitorProfile = Stand;

export interface PanelLead {
  id: string;
  standId: string;
  name: string;
  email: string;
  interestTag: string;
  /** ISO 8601 */
  capturedAt: string;
}

export interface StandCheckIn {
  id: string;
  standId: string;
  visitorLabel: string;
  /** ISO 8601 */
  checkedInAt: string;
}

export interface FlashPromotion {
  id: string;
  standId: string;
  title: string;
  discountLabel: string;
  /** ISO 8601 */
  activeFrom: string;
  /** ISO 8601 */
  activeTo: string;
  status: "programada" | "activa" | "finalizada";
}

export interface PanelEventSummary {
  id: string;
  name: string;
  city: string;
  status: "actual" | "proximamente" | "plantilla";
  description: string;
}
