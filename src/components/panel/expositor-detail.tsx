"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { zones } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { PointsPill } from "@/components/pixel/PointsPill";
import { PanelPageHeader } from "./panel-page-header";

interface ExpositorDetailProps {
  standId: string;
}

export function ExpositorDetail({ standId }: ExpositorDetailProps) {
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  const companies = usePanelStore((state) => state.companies);

  if (!hasHydrated) return null;

  const stand = companies.find((company) => company.id === standId);
  if (!stand) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">No encontramos un expositor con ese identificador.</p>
        <Link
          href="/panel/expositores"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--expo-blue)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al directorio
        </Link>
      </div>
    );
  }

  const zone = zones.find((z) => z.id === stand.zoneId);

  return (
    <>
      <PanelPageHeader eyebrow="Expositor" title={stand.name} description={stand.description} />

      <div className="pixel-card flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs font-bold text-slate-500">
            Stand {stand.boothCode} · {zone?.name ?? stand.zoneId}
          </p>
          <div className="flex items-center gap-2">
            <StandCategoryBadge category={stand.category} />
            <PointsPill points={stand.points} size="sm" />
          </div>
        </div>

        {stand.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stand.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--expo-line)] bg-[var(--expo-bg)] px-2.5 py-1 text-xs font-bold text-[var(--expo-navy)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {stand.activity && (
          <div className="rounded-xl border-2 border-[var(--expo-line)] p-3">
            <p className="pixel-label text-slate-500">Actividad programada</p>
            <p className="mt-1 text-sm font-bold text-[var(--expo-navy)]">{stand.activity}</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Vista de solo lectura para el equipo organizador.
      </p>
    </>
  );
}
