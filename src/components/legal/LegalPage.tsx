import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PixelLogo } from "../landing/PixelIcons";

export const LEGAL_CONTACT_EMAIL = "soporte@fexpo.lat";

export type LegalSection = {
  title: string;
  body: React.ReactNode;
};

type LegalPageProps = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({ title, updatedAt, intro, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[var(--expo-bg)] text-[var(--expo-navy)] antialiased">
      <header className="border-b-2 border-[var(--expo-line)] bg-white py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-slate-600 transition-colors hover:text-[var(--expo-blue)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
          <PixelLogo />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-6">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-2 font-mono text-xs font-bold text-slate-500">
          Última actualización: {updatedAt}
        </p>
        <p className="mt-6 text-base font-medium text-slate-600 sm:text-lg">{intro}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-xl font-black sm:text-2xl">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-base leading-relaxed text-slate-700 [&_a]:font-bold [&_a]:text-[var(--expo-blue)] [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <nav className="mt-12 flex flex-wrap gap-6 border-t border-slate-200 pt-6 text-sm font-bold">
          <Link href="/privacidad" className="hover:text-[var(--expo-blue)]">
            Política de privacidad
          </Link>
          <Link href="/terminos" className="hover:text-[var(--expo-blue)]">
            Términos de servicio
          </Link>
        </nav>
      </main>
    </div>
  );
}
