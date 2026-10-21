import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Mis stands" };

export default function CompanyStandsPage() {
  redirect("/panel/mi-stand");
}
