"use client";

import { Activity, BarChart3, ScanLine, Star, UsersRound, Zap } from "lucide-react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { exhibitorApi } from "@/lib/api/exhibitor";
import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { MetricCard } from "./metric-card";
import { PanelPageHeader } from "./panel-page-header";
import { PanelVisitsChart } from "./panel-visits-chart";

export function MetricasStandView() {
  const { stand, kpis, kpisError } = useExhibitor();
  const visits = useAsyncResource(`metrics-visits:${stand?.id ?? "none"}`, () => stand ? exhibitorApi.getCheckins(stand.id) : Promise.resolve([]));

  return (
    <ExhibitorState>
      <PanelPageHeader eyebrow="Métricas" title="Resultados de la empresa" description={`Indicadores registrados para ${stand?.eventName ?? "este evento"}, agregados para todos los stands de tu empresa.`} demo={false} />
      {kpis ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Check-ins" value={String(kpis.totalCheckins)} icon={ScanLine} tone="blue" demo={false} />
        <MetricCard label="Visitantes únicos" value={String(kpis.uniqueVisitors)} icon={UsersRound} tone="violet" demo={false} />
        <MetricCard label="Primeras visitas" value={String(kpis.firstVisits)} icon={Star} tone="amber" demo={false} />
        <MetricCard label="Canjes validados" value={String(kpis.redemptionsValidated)} icon={Zap} tone="rose" demo={false} />
        <MetricCard label="Asistentes a actividades" value={String(kpis.activityAttendees)} icon={Activity} tone="mint" demo={false} />
      </div> : <p role="alert" className="panel-surface p-5 text-sm text-rose-700">{kpisError ?? "No hay métricas disponibles para este evento."}</p>}
      {stand && <section className="panel-surface mt-4 p-5 sm:p-6" aria-labelledby="stand-trend-title">
        <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0878f9]"><BarChart3 aria-hidden="true" className="h-5 w-5" /></span><div><h2 id="stand-trend-title" className="text-lg font-extrabold text-[#172344]">Visitas por día · {stand.boothCode}</h2><p className="text-xs text-[#7588a9]">Últimos 7 días del stand seleccionado, a partir de hasta 200 check-ins recientes.</p></div></div>
        {visits.status === "success" ? <PanelVisitsChart visits={visits.data} /> : visits.status === "loading" ? <p role="status" className="py-20 text-center text-sm text-[#7184a6]">Cargando visitas…</p> : <p role="alert" className="py-20 text-center text-sm text-rose-700">No se pudo cargar la gráfica. <button type="button" onClick={visits.reload} className="font-bold underline">Reintentar</button></p>}
      </section>}
      <p className="mt-5 text-sm text-[#7184a6]">Hora pico, permanencia y comparación entre eventos todavía no se miden en el backend.</p>
    </ExhibitorState>
  );
}
