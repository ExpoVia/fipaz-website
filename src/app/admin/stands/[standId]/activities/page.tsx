import type { Metadata } from "next";

import { ActivitiesAdminPage } from "@/features/activities/components/activities-admin-page";
import { adminScopeService } from "@/features/admin/admin-scope";

export const metadata: Metadata = { title: "Actividades" };

export default async function ActivitiesPage({ params }: PageProps<"/admin/stands/[standId]/activities">) {
  const { standId } = await params;
  const stand = await adminScopeService.getStand(standId);
  return <ActivitiesAdminPage standId={stand.id} standName={stand.name} />;
}
