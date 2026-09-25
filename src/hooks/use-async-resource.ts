"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Settled<T> =
  | { key: string; attempt: number; failed: false; data: T }
  | { key: string; attempt: number; failed: true; error: unknown };

interface ResourceActions<T> {
  /** Vuelve a cargar (vuelve al estado `loading`). */
  reload: () => void;
  /**
   * Actualiza los datos ya cargados sin volver a pedirlos. Se usa tras una mutación
   * exitosa con la entidad que devolvió el servicio.
   */
  setData: (update: (current: T) => T) => void;
}

/** Unión discriminada por `status`: `data` solo existe en `success`. */
export type AsyncResource<T> = ResourceActions<T> &
  (
    | { status: "loading"; data: undefined; error: undefined }
    | { status: "error"; data: undefined; error: unknown }
    | { status: "success"; data: T; error: undefined }
  );

/**
 * Carga un recurso a través de la capa de servicios y expone su ciclo de vida
 * (`loading` → `success` | `error`). `key` identifica el recurso: si cambia (otro stand,
 * otro evento) se vuelve a cargar. El estado se deriva de la solicitud resuelta, así que
 * no hay `setState` síncrono dentro del efecto.
 */
export function useAsyncResource<T>(key: string, loader: () => Promise<T>): AsyncResource<T> {
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loaderRef.current().then(
      (data) => {
        if (!cancelled) setSettled({ key, attempt, failed: false, data });
      },
      (error: unknown) => {
        if (!cancelled) setSettled({ key, attempt, failed: true, error });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  const setData = useCallback((update: (current: T) => T) => {
    setSettled((current) =>
      current && !current.failed ? { ...current, data: update(current.data) } : current,
    );
  }, []);

  const current = settled && settled.key === key && settled.attempt === attempt ? settled : null;

  if (!current) return { data: undefined, status: "loading", error: undefined, reload, setData };
  if (current.failed) {
    return { data: undefined, status: "error", error: current.error, reload, setData };
  }
  return { data: current.data, status: "success", error: undefined, reload, setData };
}
