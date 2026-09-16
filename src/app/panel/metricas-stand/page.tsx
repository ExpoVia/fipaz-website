import type { Metadata } from "next";
import { Clock, TrendingUp, Users } from "lucide-react";

import { panelCheckIns } from "@/data/panel-mock";
import { PanelPageHeader, MetricCard } from "@/components/panel";
import { ProgressBar } from "@/components/pixel/ProgressBar";

export const metadata: Metadata = { title: "Métricas de mi stand" };

const DAILY_VISIT_GOAL = 15;

export default function MetricasStandPage() {
  return (
    <>
      <PanelPageHeader
        eyebrow="Métricas"
        title="Desempeño de mi stand"
        description="Indicadores de tráfico e impacto para tu participación en el evento."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Hora pico" value="11:00 – 12:00" icon={Clock} />
        <MetricCard label="Permanencia promedio" value="4.2 min" icon={Users} />
        <MetricCard label="Impacto vs. promedio" value="+18%" icon={TrendingUp} hint="Comparado con stands de tu categoría" />
      </div>

      <div className="pixel-card mt-6 p-5">
        <p className="pixel-label text-slate-500">Objetivo de visitas del día</p>
        <ProgressBar
          value={panelCheckIns.length}
          max={DAILY_VISIT_GOAL}
          className="mt-3"
          colorClass="bg-[var(--expo-green)]"
        />
      </div>
    </>
  );
}
