import type { Metadata } from "next";

import { adminScopeService } from "@/features/admin/admin-scope";
import { AdminHome } from "@/features/admin/components/admin-home";

export const metadata: Metadata = { title: "Resumen" };

export default async function AdminPage() {
  const { stand, event } = await adminScopeService.getDefaultScope();
  return <AdminHome stand={stand} event={event} />;
}
