import type { Metadata } from "next";

import { ExpositorDetail } from "@/components/panel/expositor-detail";

export const metadata: Metadata = { title: "Expositor" };

export default async function ExpositorDetailPage({
  params,
}: PageProps<"/panel/expositores/[standId]">) {
  const { standId } = await params;
  return <ExpositorDetail standId={standId} />;
}
