import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Perfil de empresa" };

export default function CompanyProfilePage() {
  redirect("/panel/empresa");
}
