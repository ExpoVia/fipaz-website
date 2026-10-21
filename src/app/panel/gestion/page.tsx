import type { Metadata } from "next";

import { StandManagementView } from "@/components/panel/stand-management-view";

export const metadata: Metadata = { title: "Gestión del stand" };

export default function GestionPage() {
  return <StandManagementView />;
}
