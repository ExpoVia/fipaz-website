"use client";

import { RotateCcw } from "lucide-react";

import { API_MODE } from "@/lib/api/config";
import { setMockFailureEnabled, useMockFailureEnabled } from "@/lib/mock/mock-controls";
import { resetMockData } from "@/lib/mock/mock-storage";

/**
 * Herramientas solo para la demostración sin backend: permiten forzar el estado de error
 * de todas las pantallas y volver a los datos iniciales. No se muestran con el backend real
 * (`NEXT_PUBLIC_API_MODE=http`), donde no tendrían efecto.
 */
export function MockControls() {
  const failing = useMockFailureEnabled();

  if (API_MODE === "http") return null;

  return (
    <section
      aria-label="Herramientas de demostración"
      className="rounded-xl border-2 border-dashed border-[var(--expo-line)] bg-[var(--expo-bg)] p-3"
    >
      <p className="pixel-label text-slate-600">Modo demostración</p>
      <p className="mt-1 text-xs font-medium text-slate-600">
        Los datos son simulados y solo duran esta sesión.
      </p>
      <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs font-bold text-[var(--expo-navy)]">
        <input
          type="checkbox"
          checked={failing}
          onChange={(event) => setMockFailureEnabled(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--expo-blue)]"
        />
        <span>Simular error del servidor</span>
      </label>
      <button
        type="button"
        onClick={resetMockData}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border-2 border-[var(--expo-navy)] bg-white px-2.5 py-1.5 text-xs font-black text-[var(--expo-navy)] hover:bg-[var(--expo-line)]/40"
      >
        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
        Restablecer datos
      </button>
    </section>
  );
}
