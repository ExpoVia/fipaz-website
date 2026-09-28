import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiPost } from "@/lib/api/http-client";
import type { CheckIn, CheckInsService } from "./types";

/**
 * Servicio de check-ins contra el backend (`NEXT_PUBLIC_API_MODE=http`).
 *
 * `POST /stands/:standId/check-ins` es una propuesta: no existe todavía en `fexpo-backend`
 * (ver `features/admin/README.md`). Debe responder con el check-in creado (o el existente, con
 * `status: "duplicate"`, si el visitante ya registró presencia hoy en este stand) y usar los
 * códigos `QR_INVALID`, `QR_EXPIRED`, `PARTICIPANT_NOT_ACTIVE` o `STAND_NOT_ACTIVE` para los
 * rechazos, que `lib/api/http-client.ts` ya traduce a mensajes en español.
 */

const STAND_NOT_FOUND = "No encontramos el stand solicitado.";

export const checkInsHttpService: CheckInsService = {
  registerCheckIn(standId, input) {
    return apiPost<CheckIn>(API_ENDPOINTS.checkIns.byStand(standId), input, { notFoundMessage: STAND_NOT_FOUND });
  },
};
