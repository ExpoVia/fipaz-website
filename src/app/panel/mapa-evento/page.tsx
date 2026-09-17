import type { Metadata } from "next";

import { MapaEventoView } from "@/components/panel/mapa-evento-view";

export const metadata: Metadata = { title: "Mapa del evento" };

export default function MapaEventoPage() {
  return <MapaEventoView />;
}
