"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { User, Store, Building2, CheckCircle2, ArrowUpRight } from "lucide-react";
import { PixelStar } from "./PixelIcons";
import { pixelifyFont } from "./fonts";
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
    headerBg: "bg-[var(--expo-blue)]",
    badgeColor: "bg-[var(--expo-sky)] text-[var(--expo-navy)]",
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
    icon: <Store aria-hidden="true" className="h-7 w-7 text-[var(--expo-navy)]" />,
    headerBg: "bg-[var(--expo-yellow)]",
    badgeColor: "bg-[var(--expo-pink)] text-[var(--expo-navy)]",
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
    headerBg: "bg-[var(--expo-purple)]",
    badgeColor: "bg-[var(--expo-mint)] text-[var(--expo-navy)]",
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
      className="relative scroll-mt-24 overflow-hidden border-t-2 border-[var(--expo-line)] bg-[var(--expo-bg)] py-20 md:py-28"
    >
      <div aria-hidden="true" data-fx-depth="36" className={`${fx.dots} pointer-events-none absolute inset-x-0 -top-24 -bottom-24`} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <span
            data-fx-intro
            className="mb-5 inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--expo-navy)] bg-white px-3 py-1 font-mono text-xs font-black tracking-wider text-[var(--expo-navy)] uppercase shadow-[2px_2px_0_var(--expo-navy)]"
          >
            <PixelStar className="h-3.5 w-3.5" />
            DATOS DE DEMOSTRACIÓN · FUNCIONES PROPUESTAS
          </span>

          <h2
            data-fx-heading
            className={`${pixelifyFont.className} text-4xl leading-[1.15] font-bold tracking-tight text-balance text-[var(--expo-navy)] sm:text-5xl lg:text-6xl`}
          >
            Visitante · Expositor · Organizador: una plataforma para varias ferias.
          </h2>

          <p data-fx-intro className="mx-auto mt-6 max-w-2xl text-base font-medium text-slate-700 sm:text-lg">
            La demo presenta una propuesta para visitantes, marcas y organizadores. Sus interacciones y métricas son ilustrativas.
          </p>
        </div>

        {/* 3 actor cards */}
        <ul className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          {actors.map((actor, idx) => (
            <li key={actor.id} id={actor.id} data-fx-deal className="scroll-mt-24">
              <div
                className={`${fx.slab} ${fx.actorCard} flex h-full flex-col justify-between overflow-hidden rounded-2xl border-3 border-[var(--expo-navy)] bg-white [--slab-offset:9px]`}
                style={{ "--accent": actor.accent } as CSSProperties}
              >
                <div>
                  <div className={`${fx.actorBand} ${actor.headerBg} border-b-3 border-[var(--expo-navy)] p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className={`${fx.actorIcon} rounded-xl border-2 border-[var(--expo-navy)] bg-white/25 p-2.5`}>{actor.icon}</div>
                      <span
                        className={`rounded border border-[var(--expo-navy)] px-2.5 py-1 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0_var(--expo-navy)] ${actor.badgeColor}`}
                      >
                        AUDIENCIA 0{idx + 1}
                      </span>
                    </div>

                    <h3 className={`${pixelifyFont.className} mt-5 text-3xl leading-none font-bold tracking-tight text-slate-900`}>
                      {actor.title}
                    </h3>

                    <p className="mt-2 text-xs leading-snug font-bold text-slate-800">{actor.subtitle}</p>
                  </div>

                  <ul className="space-y-3 p-6">
                    {actor.features.map((feature, featureIndex) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2
                          aria-hidden="true"
                          className={`${fx.check} mt-0.5 h-4 w-4 shrink-0 text-[var(--expo-green)]`}
                          style={{ "--i": featureIndex } as CSSProperties}
                        />
                        <span className="text-xs leading-normal font-semibold text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={actor.href}
                  className={`${fx.cardLink} flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4`}
                >
                  <span className="font-mono text-xs font-bold text-slate-500">Plataforma ExpoVia</span>
                  <span className="flex items-center gap-1 text-right font-mono text-xs font-bold text-[var(--expo-blue)]">
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
