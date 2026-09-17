import type { Metadata } from "next";

import { MetricasEventoView } from "@/components/panel/metricas-evento-view";

export const metadata: Metadata = { title: "Métricas del evento" };

export default function MetricasEventoPage() {
  return <MetricasEventoView />;
}
