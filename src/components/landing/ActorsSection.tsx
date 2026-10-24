"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { User, Store, Building2, CheckCircle2, ArrowUpRight } from "lucide-react";
import { PixelStar } from "./PixelIcons";
import { headingFont } from "./fonts";
import { UI_OUT, depthLayers, disposer, revealHeading, tilt, useScrollFx } from "./scroll-fx";
import fx from "./landing-fx.module.css";

const actors = [
  {
    id: "visitantes",
    href: "/demo",
    cta: "Probar como visitante",
    title: "Para Visitantes",
    subtitle: "Una propuesta de orientación y dinámicas para visitantes.",
    icon: <User aria-hidden="true" className="h-7 w-7 text-white" />,
    headerBg: "bg-[var(--expo-blue)] dark:bg-[#1479F5]",
    badgeColor: "bg-[var(--expo-sky)] text-[var(--expo-navy)] dark:bg-[#16233D] dark:text-[#A9D0FF]",
    accent: "var(--expo-blue)",
    features: [
      "Exploración de stands ficticios por rubro.",
      "Mapa de referencia con rutas ilustrativas.",
      "Puntos de ejemplo por check-ins simulados.",
      "Misiones de muestra y propuestas de recompensa.",
      "Contenido de muestra para stands y promociones.",
      "Historial local de visitas de demostración.",
    ],
  },
  {
    id: "expositores",
    href: "/panel/mi-stand",
    cta: "Abrir panel de expositor",
    title: "Para Expositores",
    subtitle: "Funciones propuestas para marcas participantes.",
    icon: <Store aria-hidden="true" className="h-7 w-7 text-[var(--expo-navy)] dark:text-[#0B1220]" />,
    headerBg: "bg-[var(--expo-yellow)] dark:bg-[#FFCA35]",
    badgeColor: "bg-[var(--expo-pink)] text-[var(--expo-navy)] dark:bg-[#16233D] dark:text-[#f4a2c0]",
    accent: "var(--expo-yellow)",
    features: [
      "Vista de ejemplo del perfil digital de una marca.",
      "Rutas ilustrativas para descubrir stands.",
      "Simulación de check-in; la validación NFC no está conectada.",
      "Ejemplos visuales de promociones, sin publicación en vivo.",
      "Datos de prospectos y visitas usados solo como muestra.",
      "Métricas de ejemplo, sin medición de asistencia real.",
    ],
  },
  {
    id: "organizadores",
    href: "/panel/metricas-evento",
    cta: "Abrir panel de organizador",
    title: "Para Organizadores",
    subtitle: "Herramientas conceptuales para organizar una feria.",
    icon: <Building2 aria-hidden="true" className="h-7 w-7 text-white" />,
    headerBg: "bg-[var(--expo-purple)] dark:bg-[#6851ea]",
    badgeColor: "bg-[var(--expo-mint)] text-[var(--expo-navy)] dark:bg-[#16233D] dark:text-[#48bb78]",
    accent: "var(--expo-purple)",
    features: [
      "Propuesta de gestión de pabellones, zonas y categorías.",
      "Vista de ejemplo para administrar pabellones, zonas y categorías.",
      "Propuesta de campañas de ejemplo para visitantes.",
      "Vista ilustrativa de actividad, sin métricas de afluencia en vivo.",
      "Propuesta de experiencia para un evento.",
      "Concepto preparado para validarse en otros eventos.",
    ],
  },
];

/** The three audiences are dealt onto the table like a hand, then lean toward the pointer once they have landed. */
function playActors(root: HTMLElement, finePointer: boolean) {
  const cleanup = disposer();
  const heading = root.querySelector<HTMLElement>("[data-fx-heading]");
  if (heading) cleanup.add(revealHeading(heading));

  const intro = root.querySelectorAll("[data-fx-intro]");
  gsap.from(intro, {
    y: 22,
    opacity: 0,
    duration: 0.7,
    ease: UI_OUT,
    stagger: 0.08,
    delay: 0.15,
    scrollTrigger: { trigger: root, start: "top 78%", once: true },
  });

  const cards = gsap.utils.toArray<HTMLElement>("[data-fx-deal]", root);
  const fan = [-5, 0, 5];
  gsap.from(cards, {
    y: 110,
    rotate: (index) => fan[index] ?? 0,
    opacity: 0,
    duration: 1,
    ease: UI_OUT,
    stagger: 0.08,
    scrollTrigger: { trigger: cards[0], start: "top 90%", once: true },
    onComplete: () => {
      gsap.set(cards, { clearProps: "all" });
      if (finePointer) cards.forEach((card) => cleanup.add(tilt(card, 2.5)));
    },
  });

  depthLayers(root);
  return cleanup.run;
}

export function ActorsSection() {
  const root = useRef<HTMLElement>(null);
  useScrollFx(root, playActors);

  return (
    <section
      ref={root}
      id="beneficios"
      className="relative scroll-mt-24 overflow-hidden border-t-2 border-[var(--expo-line)] bg-[var(--expo-bg)] py-20 md:py-28 dark:border-[#223354] dark:bg-[#0B1220]"
    >
      <div aria-hidden="true" data-fx-depth="36" className={`${fx.dots} pointer-events-none absolute inset-x-0 -top-24 -bottom-24`} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <span
            data-fx-intro
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--expo-blue)]/15 bg-white px-3.5 py-1.5 text-xs font-bold tracking-wide text-[var(--expo-navy)] shadow-sm dark:border-[#223354] dark:bg-[#101A2E] dark:text-[#F5F9FF]"
          >
            <PixelStar className="h-3.5 w-3.5" />
            Datos de demostración · funciones propuestas
          </span>

          <h2
            data-fx-heading
            className={`${headingFont.className} text-4xl leading-[1.15] font-bold tracking-tight text-balance text-[var(--expo-navy)] sm:text-5xl lg:text-6xl dark:text-[#F5F9FF]`}
          >
            Visitante · Expositor · Organizador: una plataforma para varias ferias.
          </h2>

          <p data-fx-intro className="mx-auto mt-6 max-w-2xl text-base font-medium text-slate-700 sm:text-lg dark:text-[#B8C7E6]">
            La demo presenta una propuesta para visitantes, marcas y organizadores. Sus interacciones y métricas son ilustrativas.
          </p>
        </div>

        {/* 3 actor cards */}
        <ul className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          {actors.map((actor, idx) => (
            <li key={actor.id} id={actor.id} data-fx-deal className="scroll-mt-24">
              <div
                className={`${fx.slab} ${fx.actorCard} flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-black/5 bg-white [--slab-offset:14px] dark:border-[#223354] dark:bg-[#101A2E]`}
                style={{ "--accent": actor.accent } as CSSProperties}
              >
                <div>
                  <div className={`${fx.actorBand} ${actor.headerBg} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className={`${fx.actorIcon} rounded-xl bg-white/20 p-2.5`}>{actor.icon}</div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${actor.badgeColor}`}
                      >
                        Audiencia 0{idx + 1}
                      </span>
                    </div>

                    <h3 className={`${headingFont.className} mt-5 text-3xl leading-none font-bold tracking-tight text-slate-900 dark:text-[#0B1220]`}>
                      {actor.title}
                    </h3>

                    <p className="mt-2 text-xs leading-snug font-bold text-slate-800 dark:text-slate-900">{actor.subtitle}</p>
                  </div>

                  <ul className="space-y-3 p-6">
                    {actor.features.map((feature, featureIndex) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2
                          aria-hidden="true"
                          className={`${fx.check} mt-0.5 h-4 w-4 shrink-0 text-[var(--expo-green)] dark:text-[#48bb78]`}
                          style={{ "--i": featureIndex } as CSSProperties}
                        />
                        <span className="text-xs leading-normal font-semibold text-slate-700 dark:text-[#B8C7E6]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={actor.href}
                  className={`${fx.cardLink} flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-[#223354] dark:bg-[#16233D]`}
                >
                  <span className="text-xs font-bold text-slate-500 dark:text-[#B8C7E6]">Plataforma Fexpo</span>
                  <span className="flex items-center gap-1 text-right text-xs font-bold text-[var(--expo-blue)] dark:text-[#1479F5]">
                    {actor.cta} <ArrowUpRight aria-hidden="true" className={`${fx.arrow} h-3.5 w-3.5`} />
                  </span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
