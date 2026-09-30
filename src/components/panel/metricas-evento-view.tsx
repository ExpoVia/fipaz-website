"use client";

import { Footprints, ScanLine, Star, Users } from "lucide-react";

import { zones } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import { DemoBadge } from "@/components/shared/demo-badge";
import { MetricCard } from "./metric-card";
import { PanelPageHeader } from "./panel-page-header";
import { ProgressBar } from "@/components/pixel/ProgressBar";

const ZONE_MOCK_TRAFFIC: Record<string, number> = {
  "zone-blue": 82,
  "zone-green": 61,
  "zone-yellow": 45,
  "zone-purple": 38,
};

export function MetricasEventoView() {
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  const companies = usePanelStore((state) => state.companies);

  if (!hasHydrated) return null;

  return (
    <>
      <PanelPageHeader
        eyebrow="Métricas"
        title="Afluencia de ejemplo del evento"
        description="Cifras precargadas para la demostración: agregadas, sin datos personales y sin representar afluencia real."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Visitantes (ejemplo)" value="1,284" icon={Users} />
        <MetricCard label="Check-ins verificados (ejemplo)" value="3,910" icon={ScanLine} />
        <MetricCard label="Puntos otorgados" value="48,200" icon={Star} />
        <MetricCard label="Zona más visitada" value="Zona Azul" icon={Footprints} />
      </div>

      <div className="pixel-card mt-6 flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="pixel-label text-slate-500">Ocupación por zona (ejemplo)</p>
          <DemoBadge />
        </div>
        {zones.map((zone) => (
          <div key={zone.id}>
            <div className="mb-1 flex items-center justify-between text-sm font-bold text-[var(--expo-navy)]">
              <span>{zone.name}</span>
              <span className="font-mono text-xs text-slate-500">
                {companies.filter((c) => c.zoneId === zone.id).length} expositores
              </span>
            </div>
            <ProgressBar
              value={ZONE_MOCK_TRAFFIC[zone.id] ?? 0}
              max={100}
              showLabel={false}
              colorClass="bg-[var(--expo-purple)]"
            />
          </div>
        ))}
      </div>
    </>
  );
}
