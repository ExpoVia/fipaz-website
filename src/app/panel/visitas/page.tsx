import type { Metadata } from "next";

import { VisitasView } from "@/components/panel/visitas-view";

export const metadata: Metadata = { title: "Visitas verificadas" };

export default function VisitasPage() {
  return <VisitasView />;
}
