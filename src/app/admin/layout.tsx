import type { Metadata } from "next";

import { AdminShell } from "@/components/admin";

export const metadata: Metadata = {
  title: {
    default: "Administración",
    template: "%s · Administración · ExpoVia",
  },
  description: "Administración de dinámicas, premios, inventario y actividades de stands y eventos en ExpoVia.",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
