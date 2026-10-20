import type { Metadata } from "next";

import { AccessScreen } from "@/components/auth/access-screen";
import { isPanelRole } from "@/config/panel-navigation";

export const metadata: Metadata = {
  title: "Acceso al panel",
  description: "Inicia sesión con Google para entrar al panel de expositor u organizador de ExpoVia.",
};

export default async function AccesoPage({ searchParams }: PageProps<"/acceso">) {
  const { panel } = await searchParams;
  const requested = typeof panel === "string" ? panel : null;
  return <AccessScreen panel={isPanelRole(requested) ? requested : null} />;
}
