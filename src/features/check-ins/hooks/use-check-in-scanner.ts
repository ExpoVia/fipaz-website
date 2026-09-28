"use client";

import { useCallback, useRef, useState } from "react";

import { getErrorMessage } from "@/lib/api/service-error";
import { checkInsService } from "../check-ins.service";
import { SCAN_DEBOUNCE_MS } from "../constants";
import type { CheckIn, CheckInMethod } from "../types";

export type ScanFeedback =
  | { kind: "success"; checkIn: CheckIn }
  | { kind: "duplicate"; checkIn: CheckIn }
  | { kind: "error"; message: string };

interface ScanSessionStats {
  /** Check-ins nuevos otorgados en esta sesión del navegador. */
  registered: number;
  /** Visitantes que ya habían hecho check-in hoy. */
  duplicates: number;
}

/**
 * Estado y flujo de registro del escáner: recibe credenciales (del lector de QR o del campo
 * manual), las envía a `checkInsService` y acumula el resultado como feedback + contador de
 * sesión. Vive separado de `useQrScanner` porque la cámara es un detalle de captura y esto es la
 * lógica de negocio del check-in (deduplicación, conteo, mensajes).
 */
export function useCheckInScanner(standId: string) {
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<ScanSessionStats>({ registered: 0, duplicates: 0 });

  const isProcessingRef = useRef(false);
  const lastHandledRef = useRef<{ credential: string; at: number } | null>(null);

  const submit = useCallback(
    async (credential: string, method: CheckInMethod) => {
      isProcessingRef.current = true;
      setIsProcessing(true);
      try {
        const checkIn = await checkInsService.registerCheckIn(standId, { method, credential });
        setFeedback({ kind: checkIn.status === "duplicate" ? "duplicate" : "success", checkIn });
        setStats((current) =>
          checkIn.status === "duplicate"
            ? { ...current, duplicates: current.duplicates + 1 }
            : { ...current, registered: current.registered + 1 },
        );
      } catch (error) {
        setFeedback({ kind: "error", message: getErrorMessage(error, "No pudimos registrar el check-in. Intenta nuevamente.") });
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [standId],
  );

  /** Callback de la cámara: aplica el debounce de "mismo QR" antes de enviar. */
  const handleDecode = useCallback(
    (rawText: string) => {
      const credential = rawText.trim();
      if (!credential || isProcessingRef.current) return;

      const now = Date.now();
      const last = lastHandledRef.current;
      if (last && last.credential === credential && now - last.at < SCAN_DEBOUNCE_MS) return;
      lastHandledRef.current = { credential, at: now };

      void submit(credential, "qr");
    },
    [submit],
  );

  /** Envío manual (campo de texto), para cuando la cámara no es una opción. */
  const submitManualCode = useCallback(
    (rawText: string) => {
      const credential = rawText.trim();
      if (!credential || isProcessingRef.current) return;
      lastHandledRef.current = { credential, at: Date.now() };
      void submit(credential, "manual");
    },
    [submit],
  );

  return { feedback, isProcessing, stats, handleDecode, submitManualCode };
}
