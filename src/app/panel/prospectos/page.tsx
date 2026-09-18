import type { Metadata } from "next";

import { ProspectosView } from "@/components/panel/prospectos-view";

export const metadata: Metadata = { title: "Prospectos" };

export default function ProspectosPage() {
  return <ProspectosView />;
}
