"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Star } from "lucide-react";

import { getStandById } from "@/lib/api/stands";
import type { StandResponseDto } from "@/types/stands-api";
import { PanelPageHeader } from "./panel-page-header";

interface ExpositorDetailProps {
  standId: string;
}

export function ExpositorDetail({ standId }: ExpositorDetailProps) {
  const [stand, setStand] = useState<StandResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStand = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStand(await getStandById(standId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el detalle del stand.");
    } finally {
      setLoading(false);
    }
  }, [standId]);

  useEffect(() => { void loadStand(); }, [loadStand]);

  if (loading) {
    return <div role="status" className="flex min-h-48 items-center justify-center gap-3 text-sm font-bold text-slate-400"><Loader2 className="animate-spin" size={18} /> Cargando stand…</div>;
  }

  if (error || !stand) {
    return (
      <div className="space-y-4">
        <div role="alert" className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-5 text-sm font-bold text-rose-800">
          {error || "No encontramos un stand con ese identificador."}
          {error && <button type="button" onClick={() => void loadStand()} className="ml-2 underline underline-offset-2">Reintentar</button>}
        </div>
        <Link href="/panel/expositores" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--expo-blue)] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </Link>
      </div>
    );
  }

  const location = stand.location
    ? [stand.boothCode, stand.location.zoneId && `Zona ${stand.location.zoneId}`, `Piso ${stand.location.floorId}`, `(${stand.location.x}, ${stand.location.y})`].filter(Boolean).join(" · ")
    : stand.boothCode;

  return (
    <>
      <Link href="/panel/expositores" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--expo-blue)] hover:underline">
        <ArrowLeft className="h-4 w-4" /> Volver al directorio
      </Link>
      <PanelPageHeader eyebrow="Detalle del stand" title={stand.displayName} description={stand.description ?? "Este stand todavía no tiene una descripción."} />

      <div className="pixel-card flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Empresa</p>
            <p className="mt-1 text-lg font-black text-[var(--expo-navy)]">{stand.company.displayName}</p>
          </div>
          {stand.featured && <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--expo-yellow)] px-2.5 py-1 text-xs font-black text-[var(--expo-navy)]"><Star size={13} fill="currentColor" /> Destacado</span>}
        </div>

        <p className="flex items-center gap-2 font-mono text-sm font-bold text-slate-500"><MapPin size={15} /> {location}</p>

        {stand.categories.length > 0 && <div className="flex flex-wrap gap-2">{stand.categories.map((category) => (
          <span key={category.id} className="rounded-lg bg-[var(--expo-sky)] px-2.5 py-1 text-xs font-bold text-[var(--expo-navy)]">{category.label}</span>
        ))}</div>}

        {stand.tags.length > 0 && <div className="flex flex-wrap gap-2">{stand.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-[var(--expo-line)] bg-[var(--expo-bg)] px-2.5 py-1 text-xs font-bold text-[var(--expo-navy)]">#{tag}</span>
        ))}</div>}

        {stand.activityHighlight && <div className="rounded-xl border-2 border-[var(--expo-line)] p-3">
          <p className="pixel-label text-slate-500">Actividad destacada</p>
          <p className="mt-1 text-sm font-bold text-[var(--expo-navy)]">{stand.activityHighlight}</p>
        </div>}

        {stand.promotionHighlight && <div className="rounded-xl border-2 border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/10 p-3">
          <p className="pixel-label text-slate-500">Promoción destacada</p>
          <p className="mt-1 text-sm font-bold text-[var(--expo-navy)]">{stand.promotionHighlight}</p>
        </div>}
      </div>
      <p className="mt-4 text-xs text-slate-400">Vista de solo lectura para el equipo organizador.</p>
    </>
  );
}
