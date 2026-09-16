import type { Metadata } from "next";

import { PanelDashboardClient } from "@/components/panel";

export const metadata: Metadata = { title: "Resumen" };

export default function PanelPage() {
  return <PanelDashboardClient />;
}
