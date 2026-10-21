import type { Metadata } from "next";

import { CompanyDetailsView } from "@/components/panel/company-details-view";

export const metadata: Metadata = { title: "Perfil de empresa" };

export default function EmpresaPage() {
  return <CompanyDetailsView />;
}
