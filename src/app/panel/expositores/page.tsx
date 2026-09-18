import type { Metadata } from "next";

import { ExpositoresList } from "@/components/panel/expositores-list";

export const metadata: Metadata = { title: "Expositores" };

export default function ExpositoresPage() {
  return <ExpositoresList />;
}
