"use client";

import { useEffect, useState } from "react";
import styles from "./legal.module.css";

export type TocItem = { id: string; title: string };

const linkClass = `${styles.tocLink} block rounded-lg px-3 py-2 text-sm font-bold leading-snug text-slate-600 hover:bg-white hover:text-[var(--expo-blue)]`;

export function LegalToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // La sección activa es la última cuyo encabezado ya cruzó el tercio superior de la ventana.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const list = (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            className={linkClass}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <details className="group rounded-xl border-2 border-[var(--expo-line)] bg-white lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-extrabold text-[var(--expo-navy)] [&::-webkit-details-marker]:hidden">
          En esta página
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="h-3 w-3 transition-transform duration-200 group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <nav aria-label="Secciones" className="border-t-2 border-[var(--expo-line)] p-2">
          {list}
        </nav>
      </details>

      <nav aria-label="Secciones" className="hidden lg:block">
        <p className="px-3 pb-2 text-sm font-extrabold text-[var(--expo-navy)]">En esta página</p>
        {list}
      </nav>
    </>
  );
}
