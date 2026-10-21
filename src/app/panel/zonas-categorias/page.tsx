import type { Metadata } from "next";

import { ZonasCategoriasView } from "@/components/panel/zonas-categorias-view";

export const metadata: Metadata = { title: "Zonas y categorías" };

export default function ZonasCategoriasPage() {
  return <ZonasCategoriasView />;
}
