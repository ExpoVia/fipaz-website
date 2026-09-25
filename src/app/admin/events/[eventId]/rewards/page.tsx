import type { Metadata } from "next";

import { adminScopeService } from "@/features/admin/admin-scope";
import { RewardsAdminPage } from "@/features/rewards/components/rewards-admin-page";

export const metadata: Metadata = { title: "Premios" };

export default async function RewardsPage({ params }: PageProps<"/admin/events/[eventId]/rewards">) {
  const { eventId } = await params;
  const event = await adminScopeService.getEvent(eventId);
  return <RewardsAdminPage eventId={event.id} eventName={event.name} />;
}
