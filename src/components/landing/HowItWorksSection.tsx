"use client";

import React from "react";
import { motion } from "motion/react";
import { PixelStar } from "./PixelIcons";
import styles from "./HowItWorksSection.module.css";
import { Calendar, Search, MapPin, Smartphone } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Elige tu evento",
    desc: "Explora el evento de ejemplo FIPAZ 2026; sus fechas y recinto están sujetos a confirmación.",
    icon: <Calendar className="h-6 w-6 text-[var(--expo-blue)]" />,
    tag: "INICIO",
  },
  {
    num: "02",
    title: "Encuentra una empresa o categoría",
    desc: "Filtra por rubro (Tecnología, Salud, Gastronomía, etc.) o busca directamente el stand que quieres visitar.",
    icon: <Search className="h-6 w-6 text-[var(--expo-purple)]" />,
    tag: "BÚSQUEDA",
  },
  {
    num: "03",
    title: "Sigue la ruta hasta el stand",
    desc: "Consulta un plano referencial con rutas ilustrativas; no indica distancias reales.",
    icon: <MapPin className="h-6 w-6 text-[var(--expo-coral)]" />,
    tag: "RECORRIDO",
  },
  {
    num: "04",
    title: "Acerca tu teléfono al NFC",
    desc: "La demo simula el check-in, los puntos y el avance de una misión. No registra una visita real.",
    icon: <Smartphone className="h-6 w-6 text-[var(--expo-green)]" />,
    tag: "CHECK-IN",
  },
];

const cardClass = "relative flex flex-col justify-between rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[6px_6px_0_var(--expo-navy)]";
const hoverClass = "transition-all hover:-translate-y-1";

function Card({ step, index }: { step: (typeof steps)[number]; index: number }) {
  return (
    <>
      <div>
        {/* Top Number Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
          <span className="font-mono text-4xl font-black text-[var(--expo-blue)] drop-shadow-[2px_2px_0_var(--expo-navy)]">
            {step.num}
          </span>
          <div className="rounded-lg border-2 border-[var(--expo-navy)] bg-[var(--expo-bg)] p-2 shadow-[2px_2px_0_var(--expo-navy)]">
            {step.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-5 text-xl font-black text-[var(--expo-navy)] leading-tight">
          {step.title}
        </h3>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium">
          {step.desc}
        </p>
      </div>

      {/* Step tag */}
      <div className="mt-6 pt-3 flex items-center justify-between">
        <span className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {step.tag}
        </span>
        <span className="text-xs font-mono text-[var(--expo-blue)] font-bold">
          Paso {index + 1}/4
        </span>
      </div>
    </>
  );
}

/**
 * The heading and the four steps. On the desktop entrance the pinned scene owns this copy (`scripted`): it appears
 * while the interior opens, driven by the same timeline, so it carries data hooks instead of its own scroll reveal.
 */
export function HowItWorksBody({ scripted = false }: { scripted?: boolean }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className={`${styles.header} mx-auto max-w-3xl text-center`} data-arrival-header={scripted ? "" : undefined}>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--expo-yellow)] px-3 py-1 font-mono text-xs font-black uppercase text-[var(--expo-navy)] border-2 border-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] mb-4">
          <PixelStar className="w-3.5 h-3.5" />
          DATOS DE DEMOSTRACIÓN · PASO A PASO
        </div>

        <h2 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
          Tu feria, más fácil de recorrer.
        </h2>

        <p className="mt-4 text-lg text-slate-600 font-medium">
          Cuatro sencillos pasos para transformar una visita convencional en una experiencia interactiva y guiada.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, idx) =>
          scripted ? (
            <div key={step.num} data-arrival-card className={cardClass}>
              <Card step={step} index={idx} />
            </div>
          ) : (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
              className={`${cardClass} ${hoverClass}`}
            >
              <Card step={step} index={idx} />
            </motion.div>
          ),
        )}
      </div>
    </div>
  );
}

/** Normal document flow. On the desktop entrance it only remains as the `#como-funciona` anchor (see the CSS module). */
export function HowItWorksSection() {
  return (
    <section id="como-funciona" className={`${styles.section} scroll-mt-24 bg-white py-16 md:py-24 border-t-2 border-[var(--expo-line)]`}>
      <HowItWorksBody />
    </section>
  );
}

/** The same copy, inside the pinned scene: it fades in over the interior while the iris is still opening. */
export function ArrivalOverlay() {
  return (
    <div className={styles.arrival} aria-label="Cómo funciona Fexpo">
      <div className={styles.wash} data-arrival-wash />
      <div className={styles.arrivalContent}>
        <HowItWorksBody scripted />
      </div>
    </div>
  );
}
