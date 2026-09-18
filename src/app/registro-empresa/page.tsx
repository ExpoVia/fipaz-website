import type { Metadata } from "next";

import { RegistrationHeader } from "@/components/registration/RegistrationHeader";
import { RegistrationForm } from "@/components/registration/RegistrationForm";

export const metadata: Metadata = {
  title: "Registro de empresas",
  description: "Registra tu empresa como expositora en ExpoVia y accede al panel B2B.",
};

export default function RegistroEmpresaPage() {
  return (
    <div className="min-h-screen bg-[var(--expo-bg)] text-[var(--expo-navy)] antialiased">
      <RegistrationHeader />
      <main className="mx-auto max-w-2xl px-4 pt-8 pb-16 sm:px-6">
        <RegistrationForm />
      </main>
    </div>
  );
}
