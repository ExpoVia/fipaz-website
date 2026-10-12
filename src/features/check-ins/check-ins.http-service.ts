import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiPost } from "@/lib/api/http-client";
import type { CheckIn, CheckInsService } from "./types";

/** Servicio del escáner de staff contra el contrato actual de `fexpo-backend`. */

const STAND_NOT_FOUND = "No encontramos el stand solicitado.";

interface BackendCheckInResult {
  checkinId: string;
  dailyDuplicate: boolean;
  pointsAwarded: number;
}

export const checkInsHttpService: CheckInsService = {
  async registerCheckIn(standId, input) {
    const result = await apiPost<BackendCheckInResult>(
      API_ENDPOINTS.checkIns.manualByStand(standId),
      {
        userQrToken: input.credential,
        requestKey: crypto.randomUUID(),
      },
      { notFoundMessage: STAND_NOT_FOUND },
    );

    return {
      id: result.checkinId,
      standId,
      method: input.method,
      pointsAwarded: result.pointsAwarded,
      status: result.dailyDuplicate ? "duplicate" : "new",
    } satisfies CheckIn;
  },
};
