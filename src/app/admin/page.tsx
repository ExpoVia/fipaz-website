import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { adminScopeService } from "@/features/admin/admin-scope";
import { AdminHome } from "@/features/admin/components/admin-home";
import { API_MODE } from "@/lib/api/config";

export const metadata: Metadata = { title: "Resumen" };

export default async function AdminPage() {
  if (API_MODE === "http") redirect("/panel/gestion");
  const { stand, event } = await adminScopeService.getDefaultScope();
  return <AdminHome stand={stand} event={event} />;
}
