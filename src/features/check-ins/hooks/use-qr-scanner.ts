"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

export type QrScannerStatus = "starting" | "scanning" | "error";

interface UseQrScannerOptions {
  /** Se invoca con el texto crudo cada vez que la cámara decodifica un QR en cuadro. */
  onDecode: (text: string) => void;
  /** En `false` apaga la cámara sin desmontar el componente. */
  enabled?: boolean;
}

interface UseQrScannerResult {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: QrScannerStatus;
  errorMessage: string | null;
  /** Vuelve a pedir la cámara tras un error (permiso denegado, dispositivo ocupado, etc.). */
  restart: () => void;
}

const CAMERA_PERMISSION_DENIED = "Activa el permiso de cámara en tu navegador para poder escanear.";
const CAMERA_NOT_FOUND = "No encontramos una cámara disponible en este dispositivo.";
const CAMERA_UNSUPPORTED = "Este navegador no permite acceder a la cámara. Prueba con Chrome o Safari actualizados.";
const CAMERA_GENERIC_ERROR = "No pudimos iniciar la cámara. Intenta nuevamente.";

/** Marca los rechazos que no vienen de `getUserMedia` (sin `DOMException.name` que mapear). */
class CameraUnsupportedError extends Error {}
class CameraNotReadyError extends Error {}

/** Reintentar no sirve de nada si el problema es el permiso: el usuario debe actuar primero. */
function isPermissionError(error: unknown): boolean {
  const name = error instanceof Error ? error.name : "";
  return name === "NotAllowedError" || name === "PermissionDeniedError";
}

function describeCameraError(error: unknown): string {
  if (error instanceof CameraUnsupportedError) return CAMERA_UNSUPPORTED;
  if (error instanceof CameraNotReadyError) return CAMERA_GENERIC_ERROR;
  if (isPermissionError(error)) return CAMERA_PERMISSION_DENIED;
  const name = error instanceof Error ? error.name : "";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return CAMERA_NOT_FOUND;
  return CAMERA_GENERIC_ERROR;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Lector de QR continuo sobre la cámara del dispositivo (prioriza la trasera). Envuelve
 * `@zxing/browser`: pide la cámara, dibuja el video en `videoRef` y llama a `onDecode` por cada
 * lectura exitosa. El debounce de "mismo QR dos veces seguidas" es responsabilidad de quien
 * consume `onDecode` (ver `useCheckInScanner`), no de este hook.
 *
 * Todo el estado se actualiza dentro del `.then()/.catch()` de la promesa de arranque, nunca de
 * forma síncrona en el cuerpo del efecto (mismo patrón que `useAsyncResource`).
 */
export function useQrScanner({ onDecode, enabled = true }: UseQrScannerOptions): UseQrScannerResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDecodeRef = useRef(onDecode);
  useEffect(() => {
    onDecodeRef.current = onDecode;
  });

  const [status, setStatus] = useState<QrScannerStatus>("starting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // React (sobre todo en modo Strict de desarrollo) invoca el efecto dos veces seguidas al
  // montar: la primera pasada queda "cancelada" antes de que su propia `getUserMedia` resuelva.
  // Si esa pasada obsoleta y la nueva llegaran a tener una cámara abierta a la vez sobre el
  // MISMO <video>, `stop()` de la obsoleta le borra el `srcObject` a la vigente (ambas comparten
  // el mismo elemento). Por eso el arranque y el apagado se encolan aquí en una única cadena por
  // hook: la limpieza de una pasada siempre termina de correr antes de que la siguiente pida cámara.
  const chainRef = useRef(Promise.resolve());
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function start(): Promise<IScannerControls> {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new CameraUnsupportedError();
      }
      const videoElement = videoRef.current;
      if (!videoElement) throw new CameraNotReadyError();

      const reader = new BrowserQRCodeReader();
      const constraints: MediaStreamConstraints = { audio: false, video: { facingMode: { ideal: "environment" } } };
      const onFrame: Parameters<typeof reader.decodeFromConstraints>[2] = (result) => {
        if (!cancelled && result) onDecodeRef.current(result.getText());
      };

      try {
        return await reader.decodeFromConstraints(constraints, videoElement, onFrame);
      } catch (error) {
        // El dispositivo puede tardar unos milisegundos en soltar la cámara que acaba de liberar
        // otra instancia de este hook (p. ej. el doble montaje de Strict Mode en desarrollo);
        // un único reintento corto evita mostrar un error que se resuelve solo un instante después.
        if (isPermissionError(error)) throw error;
        await wait(300);
        return reader.decodeFromConstraints(constraints, videoElement, onFrame);
      }
    }

    chainRef.current = chainRef.current.then(() =>
      start()
        .then((activeControls) => {
          if (cancelled) {
            activeControls.stop();
            return;
          }
          controlsRef.current = activeControls;
          setStatus("scanning");
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setStatus("error");
          setErrorMessage(describeCameraError(error));
        }),
    );

    return () => {
      cancelled = true;
      chainRef.current = chainRef.current.then(() => {
        controlsRef.current?.stop();
        controlsRef.current = null;
      });
    };
  }, [enabled, attempt]);

  const restart = useCallback(() => {
    setStatus("starting");
    setErrorMessage(null);
    setAttempt((current) => current + 1);
  }, []);

  return { videoRef, status, errorMessage, restart };
}
