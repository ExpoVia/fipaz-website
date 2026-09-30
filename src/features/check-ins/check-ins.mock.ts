import { createMockCollection } from "@/lib/mock/mock-collection";
import type { CheckIn } from "./types";

interface MockVisitor {
  participantId: string;
  participantName: string;
  participantPhotoUrl?: string;
  /** `false` simula PARTICIPANT_NOT_ACTIVE (inscripción cancelada o evento vencido). */
  active: boolean;
}

/**
 * Directorio de credenciales de prueba para el modo simulado (no hay backend real que emita
 * tokens de QR). Genera un QR con cualquiera de estos textos, p. ej. en
 * https://www.qr-code-generator.com, para probar el escáner de punta a punta; o pégalos en el
 * campo manual de la pantalla. `QR-EXPIRADO` y `QR-STAND-INACTIVO` fuerzan esos errores.
 */
const MOCK_VISITORS: Readonly<Record<string, MockVisitor>> = {
  "FIPAZ-VISITANTE-4821": { participantId: "visitor-4821", participantName: "Daniela Rocha", active: true },
  "FIPAZ-VISITANTE-4835": { participantId: "visitor-4835", participantName: "Marco Quispe", active: true },
  "FIPAZ-VISITANTE-4902": { participantId: "visitor-4902", participantName: "Valeria Fernández", active: true },
  "FIPAZ-VISITANTE-5010": { participantId: "visitor-5010", participantName: "Jorge Salinas", active: false },
};

export function findMockVisitor(credential: string): MockVisitor | undefined {
  return MOCK_VISITORS[credential.trim().toUpperCase()];
}

/** Historial de check-ins de la sesión simulada (persiste en sessionStorage, como el resto del mock). */
export const checkInsStore = createMockCollection<CheckIn>("check-ins", () => []);
