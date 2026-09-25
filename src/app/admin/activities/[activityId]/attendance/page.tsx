import type { Metadata } from "next";

import { AttendanceAdminPage } from "@/features/activities/components/attendance-admin-page";
import { isParticipantState } from "@/features/activities/attendance";

export const metadata: Metadata = { title: "Asistencia" };

export default async function AttendancePage({
  params,
  searchParams,
}: PageProps<"/admin/activities/[activityId]/attendance">) {
  const [{ activityId }, { status }] = await Promise.all([params, searchParams]);
  const initialStatus = typeof status === "string" && isParticipantState(status) ? status : undefined;

  return <AttendanceAdminPage activityId={activityId} initialStatus={initialStatus} />;
}
