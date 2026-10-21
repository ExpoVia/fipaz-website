"use client";

import type { ReactNode } from "react";

import { useExhibitor } from "./exhibitor-context";

export function ExhibitorState({ children, requireStand = true }: { children: ReactNode; requireStand?: boolean }) {
  const { company, stands, stand, loading, error, reload, selectStand } = useExhibitor();

  if (loading) return <p role="status" className="text-sm font-bold text-slate-500">Cargando datos del expositor…</p>;
  if (error) return (
    <div role="alert" className="rounded-xl border-2 border-rose-400 bg-rose-50 p-5 text-sm text-rose-900">
      <p>{error}</p>
      <button type="button" onClick={() => void reload()} className="mt-3 font-bold underline">Reintentar</button>
    </div>
  );
  if (!company) return <p role="alert">No se encontró la empresa de esta cuenta.</p>;
  if (requireStand && !stand) return (
    <div role="status" className="pixel-card p-6">
      <h2 className="font-black text-[var(--expo-navy)]">Aún no tienes un stand asignado</h2>
      <p className="mt-2 text-sm text-slate-600">Tu empresa está registrada, pero el organizador todavía no le asignó un stand. Cuando lo haga, aparecerá aquí.</p>
      <button type="button" onClick={() => void reload()} className="mt-4 text-sm font-bold text-[var(--expo-blue)] underline">Actualizar</button>
    </div>
  );

  return (
    <>
      {stands.length > 1 && (
        <label className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--expo-navy)]">
          Stand activo
          <select value={stand?.id ?? ""} onChange={(event) => selectStand(event.target.value)} className="rounded-lg border-2 border-[var(--expo-line)] bg-white px-3 py-2">
            {stands.map((item) => <option key={item.id} value={item.id}>{item.eventName} · {item.boothCode}</option>)}
          </select>
        </label>
      )}
      {children}
    </>
  );
}
