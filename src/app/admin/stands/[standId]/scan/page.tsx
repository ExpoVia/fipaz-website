import type { Metadata } from "next";

import { ScanAdminPage } from "@/features/check-ins/components/scan-admin-page";
import { adminScopeService } from "@/features/admin/admin-scope";

export const metadata: Metadata = { title: "Escáner QR" };

export default async function ScanPage({ params }: PageProps<"/admin/stands/[standId]/scan">) {
  const { standId } = await params;
  const stand = await adminScopeService.getStand(standId);
  return <ScanAdminPage standId={stand.id} standName={stand.name} />;
}
