import type { Metadata } from "next";

import { QrStandView } from "@/components/panel/qr-stand-view";

export const metadata: Metadata = { title: "QR de validación" };

export default function QrStandPage() {
  return <QrStandView />;
}
