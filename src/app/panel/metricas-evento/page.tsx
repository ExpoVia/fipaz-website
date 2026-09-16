import type { Metadata } from "next";
import { Footprints, ScanLine, Star, Users } from "lucide-react";

import { stands, zones } from "@/data/demo-data";
import { PanelPageHeader, MetricCard } from "@/components/panel";
import { ProgressBar } from "@/components/pixel/ProgressBar";

export const metadata: Metadata = { title: "Métricas del evento" };

const ZONE_MOCK_TRAFFIC: Record<string, number> = {
  "zone-blue": 82,
  "zone-green": 61,
  "zone-yellow": 45,
  "zone-purple": 38,
};

export default function MetricasEventoPage() {
  return (
    <>
      <PanelPageHeader
        eyebrow="Métricas"
        title="Afluencia del evento"
        description="Flujo de personas y actividad consolidada en tiempo real (datos simulados)."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Visitantes activos" value="1,284" icon={Users} />
        <MetricCard label="Check-ins totales" value="3,910" icon={ScanLine} />
        <MetricCard label="Puntos otorgados" value="48,200" icon={Star} />
        <MetricCard label="Zona más visitada" value="Zona Azul" icon={Footprints} />
      </div>

      <div className="pixel-card mt-6 flex flex-col gap-4 p-5">
        <p className="pixel-label text-slate-500">Ocupación por zona</p>
        {zones.map((zone) => (
          <div key={zone.id}>
            <div className="mb-1 flex items-center justify-between text-sm font-bold text-[var(--expo-navy)]">
              <span>{zone.name}</span>
              <span className="font-mono text-xs text-slate-500">
                {stands.filter((s) => s.zoneId === zone.id).length} expositores
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
