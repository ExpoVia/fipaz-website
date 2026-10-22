import type { Metadata } from "next";

import { PanelShell } from "@/components/panel";
import "./panel-theme.css";

export const metadata: Metadata = {
  title: {
    default: "Panel",
    template: "%s · Panel · Fexpo",
  },
  description: "Panel de Fexpo para expositores y organizadores.",
};

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return <PanelShell>{children}</PanelShell>;
}
