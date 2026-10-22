import type { Metadata } from "next";

import { AdminShell } from "@/components/admin";
import "../panel/panel-theme.css";

export const metadata: Metadata = {
  title: {
    default: "Administración",
    template: "%s · Administración · Fexpo",
  },
  description: "Administración de dinámicas, premios, inventario y actividades de stands y eventos en Fexpo.",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
