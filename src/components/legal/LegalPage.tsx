import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { PixelStar } from "../landing/PixelIcons";
import { ThemeToggle } from "../theme/ThemeToggle";
import { LegalToc } from "./LegalToc";
import styles from "./legal.module.css";

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
  current: "privacidad" | "terminos";
};

const DOCUMENTS = [
  { key: "privacidad", href: "/privacidad", label: "Privacidad" },
  { key: "terminos", href: "/terminos", label: "Términos" },
] as const;

// Los rombos del logotipo, en su misma paleta, marcan el ritmo de los encabezados.
const MARKER_COLORS = ["var(--expo-blue)", "var(--expo-purple)", "var(--expo-yellow)", "var(--expo-sky)"];

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const rise = (i: number) => ({ style: { "--i": i } as React.CSSProperties });

export function LegalPage({ title, updatedAt, intro, sections, current }: LegalPageProps) {
  const items = sections.map((section) => ({ id: slugify(section.title), title: section.title }));

  return (
    <div className="min-h-screen bg-[var(--expo-bg)] text-[var(--expo-navy)] antialiased dark:text-[#F5F9FF]">
      <header className="sticky top-0 z-40 border-b-2 border-[var(--expo-line)] bg-white/95 dark:border-[#223354] dark:bg-[#101A2E]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <Link href="/" aria-label="Fexpo, ir al inicio" className={`${styles.press} flex items-center`}>
            <Image
              src="/img/landing/fexpo-logo.png"
              alt="Fexpo"
              width={1254}
              height={388}
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="icon" />
            <Link
              href="/"
              className={`${styles.back} inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600 transition-colors duration-150 hover:text-[var(--expo-blue)] dark:text-[#B8C7E6] dark:hover:text-[#A9D0FF]`}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </header>

      <div className={`${styles.dots} relative overflow-hidden border-b-2 border-[var(--expo-line)] dark:border-[#223354]`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 md:block">
          <span className={`${styles.diamond} right-[22%] top-[18%] h-16 w-16 bg-[var(--expo-blue)]`} />
          <span className={`${styles.diamond} right-[6%] top-[38%] h-20 w-20 bg-[var(--expo-purple)]`} />
          <span className={`${styles.diamond} right-[38%] top-[52%] h-10 w-10 bg-[var(--expo-yellow)]`} />
          <span className={`${styles.diamond} right-[20%] top-[68%] h-7 w-7 bg-[var(--expo-sky)]`} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
          <div {...rise(0)} className={`${styles.rise} inline-flex rounded-xl border-2 border-[var(--expo-line)] bg-white p-1 dark:border-[#223354] dark:bg-[#101A2E]`}>
            {DOCUMENTS.map((doc) => (
              <Link
                key={doc.key}
                href={doc.href}
                aria-current={doc.key === current ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-extrabold transition-colors duration-150 ${
                  doc.key === current
                    ? "bg-[var(--expo-navy)] text-white dark:bg-[#1479F5]"
                    : "text-slate-600 hover:bg-[var(--expo-bg)] hover:text-[var(--expo-blue)] dark:text-[#B8C7E6] dark:hover:bg-[#16233D] dark:hover:text-[#A9D0FF]"
                }`}
              >
                {doc.label}
              </Link>
            ))}
          </div>

          <h1
            {...rise(1)}
            className={`${styles.rise} mt-6 max-w-2xl text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-[var(--expo-navy)] dark:text-[#F5F9FF]`}
          >
            {title}
          </h1>
          <p {...rise(2)} className={`${styles.rise} mt-5 max-w-2xl text-pretty text-base font-medium leading-relaxed text-slate-700 sm:text-lg dark:text-[#B8C7E6]`}>
            {intro}
          </p>
          <p
            {...rise(3)}
            className={`${styles.rise} mt-6 inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--expo-navy)] bg-white px-3 py-1 font-mono text-xs font-black shadow-[2px_2px_0_var(--expo-navy)] dark:border-[#223354] dark:bg-[#16233D] dark:shadow-none dark:text-[#F5F9FF]`}
          >
            <PixelStar className="h-3.5 w-3.5 text-amber-400" />
            Actualizado el {updatedAt}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:pt-14">
        <aside className="mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-24">
            <LegalToc items={items} />
          </div>
        </aside>

        <article className="max-w-[44rem]">
          {sections.map((section, index) => (
            <section
              key={section.title}
              id={items[index].id}
              className={`scroll-mt-24 ${index === 0 ? "" : "mt-12 border-t-2 border-[var(--expo-line)] pt-12 dark:border-[#223354]"}`}
            >
              <h2 className="flex items-center gap-3 text-balance text-2xl font-black leading-tight tracking-tight sm:text-[1.75rem] text-[var(--expo-navy)] dark:text-[#F5F9FF]">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 rotate-45 rounded-[3px]"
                  style={{ background: MARKER_COLORS[index % MARKER_COLORS.length] }}
                />
                {section.title}
              </h2>
              <div className={`${styles.prose} mt-4 space-y-4 text-base leading-relaxed text-slate-700 sm:text-[1.0625rem] sm:leading-[1.75] dark:text-[#B8C7E6]`}>
                {section.body}
              </div>
            </section>
          ))}

          <aside className="mt-16 flex flex-col gap-5 rounded-2xl border-2 border-[var(--expo-navy)] bg-white p-6 shadow-[5px_5px_0_var(--expo-navy)] sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:border-[#223354] dark:bg-[#101A2E] dark:shadow-none">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[var(--expo-navy)] dark:text-[#F5F9FF]">¿Tienes dudas sobre este documento?</h2>
              <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base dark:text-[#B8C7E6]">
                Escríbenos y respondemos desde el equipo de Fexpo.
              </p>
            </div>
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-5 py-2.5 text-sm font-extrabold text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)] transition-[translate,box-shadow,background-color] duration-150 ease-out hover:bg-[#FFE066] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transition-none dark:border-[#223354] dark:bg-[#FFCA35] dark:text-[#0B1220] dark:shadow-none"
            >
              <Mail aria-hidden="true" className="h-4 w-4 stroke-[3]" />
              {LEGAL_CONTACT_EMAIL}
            </a>
          </aside>
        </article>
      </main>

      <footer className="border-t-2 border-[var(--expo-navy)] bg-white py-10 dark:border-[#223354] dark:bg-[#0B1220]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <Link href="/" aria-label="Fexpo, ir al inicio" className={styles.press}>
              <Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={1254} height={388} className="h-10 w-auto" />
            </Link>
            <p className="font-mono text-xs font-bold text-slate-500 dark:text-[#B8C7E6]">Eventos que te mueven.</p>
          </div>
          <nav aria-label="Documentos legales" className="flex flex-wrap items-center justify-center gap-7 text-sm font-bold">
            {DOCUMENTS.map((doc) => (
              <Link
                key={doc.key}
                href={doc.href}
                aria-current={doc.key === current ? "page" : undefined}
                className="transition-colors duration-150 hover:text-[var(--expo-blue)] aria-[current=page]:text-[var(--expo-blue)] dark:hover:text-[#A9D0FF] dark:aria-[current=page]:text-[#A9D0FF]"
              >
                {doc.label}
              </Link>
            ))}
            <Link href="/" className="transition-colors duration-150 hover:text-[var(--expo-blue)] dark:hover:text-[#A9D0FF]">
              Inicio
            </Link>
          </nav>
        </div>
        <p className="mt-6 px-4 text-center text-xs font-medium text-slate-500 dark:text-[#B8C7E6]">
          © 2026 Fexpo. Plataforma digital para ferias y eventos físicos.
        </p>
      </footer>
    </div>
  );
}
