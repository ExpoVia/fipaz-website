// Config del panel publica el contrato de rol; se reexporta para evitar una
// segunda unión que pueda divergir (mismo criterio que src/types/demo.ts con DemoTab).
import type { PanelRole } from "@/config/panel-navigation";
import type { Stand, StandCategory } from "@/types/demo";

export type { PanelRole };

/**
 * En el panel, una empresa expositora es un `Stand` con un dato de contacto
 * adicional (no existe en el catálogo público de la demo del visitante).
 */
export interface ExhibitorProfile extends Stand {
  contactEmail?: string;
  websiteUrl?: string;
}

/** Datos capturados en el formulario público de registro de una nueva empresa. */
export interface CompanyRegistrationInput {
  name: string;
  category: StandCategory;
  customCategory?: string;
  description: string;
  contactEmail: string;
}

/** Subconjunto editable desde "Mi stand" tras el registro inicial. */
export interface CompanyProfileInput {
  name: string;
  category: StandCategory;
  customCategory?: string;
  description: string;
  contactEmail: string;
  logoPath?: string;
  websiteUrl?: string;
  tags: string[];
  activity?: string;
  promotion?: string;
}

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

/** Un QR de check-in generado por la empresa para su stand. */
export interface QrToken {
  /** UUID corto único */
  id: string;
  standId: string;
  /** Tiempo de vida en segundos (30 | 60 | 120 | 300) */
  ttl: number;
  /** Máximo de escaneos — 0 = ilimitado */
  maxScans: number;
  scansUsed: number;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  expiresAt: string;
  status: "active" | "expired" | "revoked";
}
