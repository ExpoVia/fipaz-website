"use client";

import { useCallback, useState } from "react";

/**
 * Registra qué filas tienen una operación en curso (activar, confirmar asistencia…) para
 * deshabilitar sus acciones y evitar envíos dobles, sin bloquear el resto de la tabla.
 */
export function useBusyIds() {
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());

  const run = useCallback(async <T,>(id: string, task: () => Promise<T>): Promise<T> => {
    setBusy((current) => new Set(current).add(id));
    try {
      return await task();
    } finally {
      setBusy((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const isBusy = useCallback((id: string) => busy.has(id), [busy]);

  return { isBusy, run };
}
