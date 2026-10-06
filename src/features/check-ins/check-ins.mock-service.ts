import { ServiceError } from "@/lib/api/service-error";
import { createMockId, mockRequest } from "@/lib/mock/mock-runtime";
import { checkInsStore, findMockVisitor } from "./check-ins.mock";
import { MOCK_CHECK_IN_POINTS } from "./constants";
import type { CheckIn, CheckInsService } from "./types";

/**
 * Servicio SIMULADO de check-ins (`NEXT_PUBLIC_API_MODE=mock`, el valor por defecto).
 *
 * No hay un backend real emitiendo QR de visitantes, así que la credencial se resuelve contra
 * el directorio de prueba de `check-ins.mock.ts`. La implementación contra el backend está en
 * `check-ins.http-service.ts`; `check-ins.service.ts` elige cuál se usa.
 */

const QR_INVALID_MESSAGE = "El código QR no es válido. Pide al visitante que lo actualice desde su app.";

function isSameCalendarDay(isoA: string | undefined, isoB: string): boolean {
  return isoA !== undefined && isoA.slice(0, 10) === isoB.slice(0, 10);
}

export const checkInsMockService: CheckInsService = {
  registerCheckIn(standId, { method, credential }) {
    return mockRequest((): CheckIn => {
      const token = credential.trim();
      if (token === "") throw new ServiceError("VALIDATION", QR_INVALID_MESSAGE);

      if (token.toUpperCase() === "QR-EXPIRADO") {
        throw new ServiceError(
          "VALIDATION",
          "El código QR expiró. Pide al visitante que abra su app para generar uno nuevo.",
        );
      }
      if (token.toUpperCase() === "QR-STAND-INACTIVO") {
        throw new ServiceError("VALIDATION", "El stand no está activo.");
      }

      const visitor = findMockVisitor(token);
      if (!visitor) throw new ServiceError("VALIDATION", QR_INVALID_MESSAGE);
      if (!visitor.active) {
        throw new ServiceError("VALIDATION", "Este visitante no tiene una inscripción activa en el evento.");
      }

      const now = new Date().toISOString();
      const previous = checkInsStore
        .all()
        .find(
          (item) =>
            item.standId === standId &&
            item.participantId === visitor.participantId &&
            isSameCalendarDay(item.checkedInAt, now),
        );
      if (previous) return { ...previous, status: "duplicate" };

      return checkInsStore.insert({
        id: createMockId("checkin"),
        standId,
        participantId: visitor.participantId,
        participantName: visitor.participantName,
        participantPhotoUrl: visitor.participantPhotoUrl,
        method,
        pointsAwarded: MOCK_CHECK_IN_POINTS,
        checkedInAt: now,
        status: "new",
      });
    });
  },
};
