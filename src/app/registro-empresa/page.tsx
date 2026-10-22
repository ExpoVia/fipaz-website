import type { Metadata } from "next";

import { RegistrationForm } from "@/components/registration/RegistrationForm";

export const metadata: Metadata = {
  title: "Registro de empresas",
  description: "Registra tu empresa como expositora en ExpoVia y accede al panel B2B.",
};

export default function RegistroEmpresaPage() {
  return <RegistrationForm />;
}
