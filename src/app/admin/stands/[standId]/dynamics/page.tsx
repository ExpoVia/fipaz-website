import type { Metadata } from "next";

import { adminScopeService } from "@/features/admin/admin-scope";
import { DynamicsAdminPage } from "@/features/dynamics/components/dynamics-admin-page";

export const metadata: Metadata = { title: "Dinámicas" };

export default async function DynamicsPage({ params }: PageProps<"/admin/stands/[standId]/dynamics">) {
  const { standId } = await params;
  const stand = await adminScopeService.getStand(standId);
  return <DynamicsAdminPage standId={stand.id} standName={stand.name} />;
}
