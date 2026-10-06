/** `manual` indica entrada pegada/escrita en el panel; el contenido sigue siendo el QR personal. */
export type CheckInMethod = "qr" | "nfc" | "manual";

/**
 * Un segundo escaneo del mismo visitante el mismo día no es un error: `status` deja que la UI
 * lo muestre como aviso amigable ("ya hizo check-in hoy") en vez de un error rojo, tal como pide
 * la tarjeta de escáner de visitantes.
 */
export type CheckInResultStatus = "new" | "duplicate";

export interface CheckIn {
  id: string;
  standId: string;
  participantId?: string;
  participantName?: string;
  participantPhotoUrl?: string;
  method: CheckInMethod;
  pointsAwarded: number;
  /** ISO 8601; el endpoint de staff no incluye la hora en su respuesta. */
  checkedInAt?: string;
  status: CheckInResultStatus;
}

/** Lo que envía el escáner al registrar un check-in. */
export interface CheckInInput {
  method: CheckInMethod;
  /** Token personal del visitante leído por cámara o ingresado en el campo manual. */
  credential: string;
}

/**
 * Contrato del servicio. Lo implementan `check-ins.mock-service.ts` (datos simulados) y
 * `check-ins.http-service.ts` (backend); ambas respetan exactamente esta firma.
 */
export interface CheckInsService {
  /**
   * POST /stands/:standId/check-ins (propuesta). Errores que debe distinguir el backend:
   * `QR_INVALID`, `QR_EXPIRED`, `PARTICIPANT_NOT_ACTIVE`, `STAND_NOT_ACTIVE`.
   */
  registerCheckIn(standId: string, input: CheckInInput): Promise<CheckIn>;
}
