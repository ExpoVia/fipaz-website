import type { Metadata } from "next";

import { adminScopeService } from "@/features/admin/admin-scope";
import { InventoryAdminPage } from "@/features/inventory/components/inventory-admin-page";

export const metadata: Metadata = { title: "Inventario" };

export default async function InventoryPage({
  params,
  searchParams,
}: PageProps<"/admin/events/[eventId]/inventory">) {
  const [{ eventId }, { reward }] = await Promise.all([params, searchParams]);
  const event = await adminScopeService.getEvent(eventId);

  return (
    <InventoryAdminPage
      eventId={event.id}
      eventName={event.name}
      initialRewardId={typeof reward === "string" ? reward : undefined}
    />
  );
}
