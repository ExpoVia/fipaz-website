import type { Metadata } from "next";

import { EventosView } from "@/components/panel/eventos-view";

export const metadata: Metadata = { title: "Eventos" };

export default function EventosPage() {
  return <EventosView />;
}
