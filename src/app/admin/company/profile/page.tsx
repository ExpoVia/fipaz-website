import type { Metadata } from "next";

import { CompanyProfileView } from "@/components/admin/company-profile-view";

export const metadata: Metadata = { title: "Perfil de empresa" };

export default function CompanyProfilePage() {
  return <CompanyProfileView />;
}
