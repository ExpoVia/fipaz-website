import type { Metadata } from "next";

import { PromocionesView } from "@/components/panel/promociones-view";

export const metadata: Metadata = { title: "Ofertas relámpago" };

export default function PromocionesPage() {
  return <PromocionesView />;
}
