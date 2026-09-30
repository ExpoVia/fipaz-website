import type { Metadata } from "next";

import { CompanyStandsView } from "@/components/admin/company-stands-view";

export const metadata: Metadata = { title: "Mis stands" };

export default function CompanyStandsPage() {
  return <CompanyStandsView />;
}
