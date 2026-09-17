import type { Metadata } from "next";

import { CompanyProfileForm } from "@/components/panel/company-profile-form";

export const metadata: Metadata = { title: "Editar mi stand" };

export default function EditarMiStandPage() {
  return <CompanyProfileForm />;
}
