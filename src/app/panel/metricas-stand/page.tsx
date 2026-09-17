import type { Metadata } from "next";

import { MetricasStandView } from "@/components/panel/metricas-stand-view";

export const metadata: Metadata = { title: "Métricas de mi stand" };

export default function MetricasStandPage() {
  return <MetricasStandView />;
}
