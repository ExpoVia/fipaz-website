import type { Metadata } from "next";

import { MiStandView } from "@/components/panel/mi-stand-view";

export const metadata: Metadata = { title: "Mi stand" };

export default function MiStandPage() {
  return <MiStandView />;
}
