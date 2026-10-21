import type { Metadata } from "next";

import { GamificacionView } from "@/components/panel/gamificacion-view";

export const metadata: Metadata = { title: "Gamificación" };

export default function GamificacionPage() {
  return <GamificacionView />;
}
