import type { Metadata } from "next";

import { PanelShell } from "@/components/panel";

export const metadata: Metadata = {
  title: {
    default: "Panel",
    template: "%s · Panel · ExpoVia",
  },
  description: "Maqueta del panel administrativo B2B de ExpoVia para expositores y organizadores.",
};

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return <PanelShell>{children}</PanelShell>;
}
