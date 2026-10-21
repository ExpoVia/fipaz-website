"use client";

import { Activity, ScanLine, UsersRound } from "lucide-react";

import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { MetricCard } from "./metric-card";
import { PanelPageHeader } from "./panel-page-header";

export function MetricasStandView() {
  const { stand, kpis, kpisError } = useExhibitor();
  return (
    <ExhibitorState>
      <PanelPageHeader eyebrow="Métricas" title="Resultados de la empresa" description={`Indicadores reales de ${stand?.eventName ?? "este evento"}, agregados para todos los stands de tu empresa.`} demo={false} />
      {kpis ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Check-ins" value={String(kpis.totalCheckins)} icon={ScanLine} demo={false} />
          <MetricCard label="Visitantes únicos" value={String(kpis.uniqueVisitors)} icon={UsersRound} demo={false} />
          <MetricCard label="Asistentes a actividades" value={String(kpis.activityAttendees)} icon={Activity} demo={false} />
        </div>
      ) : <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{kpisError ?? "No hay métricas disponibles para este evento."}</p>}
      <p className="mt-5 text-sm text-slate-500">Hora pico, permanencia e impacto comparativo todavía no se miden en el backend.</p>
    </ExhibitorState>
  );
}
