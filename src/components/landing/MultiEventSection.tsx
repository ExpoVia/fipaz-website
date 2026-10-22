"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { PixelStar } from "./PixelIcons";
import { Globe, MapPin } from "lucide-react";
import { DEMO_FIXTURE } from "@/data/demo-fixture";
import { headingFont } from "./fonts";
import { UI_OUT, revealHeading, useScrollFx } from "./scroll-fx";
import fx from "./landing-fx.module.css";

const events = [
  {
    name: DEMO_FIXTURE.event.name,
    location: `${DEMO_FIXTURE.event.city} · ${DEMO_FIXTURE.event.venueStatus.toLowerCase()}`,
    status: "PILOTO",
    statusColor: "bg-[var(--expo-yellow)] text-[var(--expo-navy)]",
    desc: "Feria Internacional de La Paz. Plataforma de prueba y desarrollo conceptual.",
    active: true,
  },
  {
    name: "Expocruz",
    location: "Santa Cruz, Bolivia",
    status: "PROYECCIÓN",
    statusColor: "bg-sky-100 text-[var(--expo-blue)]",
    desc: "Expansión proyectada para ferias multisectoriales de gran escala.",
    active: false,
  },
  {
    name: "La Paz Expone",
    location: "La Paz, Bolivia",
    status: "EJEMPLO",
    statusColor: "bg-purple-100 text-[var(--expo-purple)]",
    desc: "Integración modular para eventos empresariales e industriales.",
    active: false,
  },
  {
    name: "Próximos Eventos",
    location: "Nivel Nacional e Internacional",
    status: "ECOSISTEMA",
    statusColor: "bg-emerald-100 text-emerald-800",
    desc: "Un perfil común es parte de la propuesta; esta demo no sincroniza datos entre eventos.",
    active: false,
  },
];

/** One profile travelling between events: the connector draws from the pilot outward and each event lights as it arrives. */
function playMultiEvent(root: HTMLElement) {
  const heading = root.querySelector<HTMLElement>("[data-fx-heading]");
  const stopHeading = heading ? revealHeading(heading) : undefined;

  gsap.from(root.querySelectorAll("[data-fx-intro]"), {
    y: 22,
    opacity: 0,
    duration: 0.7,
    ease: UI_OUT,
    stagger: 0.08,
    delay: 0.15,
    scrollTrigger: { trigger: root, start: "top 78%", once: true },
  });

  const track = root.querySelector<HTMLElement>("[data-fx-track]");
  const line = root.querySelector<HTMLElement>("[data-fx-line]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-fx-event]", root);
  if (track && cards.length) {
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: track, start: "top 92%", end: "bottom 82%", scrub: 0.6 },
    });
    if (line) timeline.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: cards.length }, 0);
    cards.forEach((card, index) => {
      timeline.fromTo(card, { y: 56, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, index * 0.85);
    });
  }

  return stopHeading;
}

export function MultiEventSection() {
  const root = useRef<HTMLElement>(null);
  useScrollFx(root, playMultiEvent);

  return (
    <section
      ref={root}
      id="multi-evento"
      className="relative scroll-mt-24 overflow-hidden border-t border-[var(--expo-line)] bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <div
            data-fx-intro
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-bold tracking-wide text-[var(--expo-blue)]"
          >
            <Globe aria-hidden="true" className="h-3.5 w-3.5" />
            Datos de demostración · visión multi-evento
          </div>

          <h2
            data-fx-heading
            className={`${headingFont.className} text-4xl leading-[1.15] font-bold tracking-tight text-balance text-[var(--expo-navy)] sm:text-5xl lg:text-6xl`}
          >
            Un perfil. Múltiples eventos. Nuevas conexiones.
          </h2>

          <p data-fx-intro className="mx-auto mt-6 max-w-2xl text-base font-medium text-slate-600 sm:text-lg">
            La experiencia multi-evento es una propuesta en evaluación. Esta demo no comparte ni sincroniza datos entre ferias.
          </p>

          <p data-fx-intro className="mx-auto mt-3 max-w-2xl text-sm font-bold text-slate-500">
            Hoy FIPAZ 2026 es el piloto. No hay selector de eventos: HuaynaFEX se muestra dentro de la app.
          </p>
        </div>

        {/* Ecosystem: cards joined by a connector */}
        <div data-fx-track className="relative mt-16">
          <div
            aria-hidden="true"
            data-fx-line
            className="absolute top-[calc(50%-2px)] right-12 left-12 z-0 hidden h-1 origin-left rounded-full bg-[linear-gradient(to_right,#1677B8_0%,#B984B6_50%,#FFC21A_100%)] lg:block"
          />

          <ul className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {events.map((evt) => (
              <li key={evt.name} data-fx-event>
                <div
                  className={`${fx.slab} ${fx.eventCard} flex h-full flex-col justify-between rounded-2xl border border-black/5 bg-white p-6 [--slab-offset:13px] ${
                    evt.active ? fx.pilot : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${evt.statusColor}`}>
                        {evt.status}
                      </span>
                      {evt.active && <PixelStar className="h-4 w-4" />}
                    </div>

                    <h3 className="mt-4 text-xl font-black text-[var(--expo-navy)]">{evt.name}</h3>

                    <p className="mt-1 flex items-center gap-1 font-mono text-xs font-bold text-slate-500">
                      <span className={fx.pin}>
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-rose-500" />
                      </span>
                      {evt.location}
                    </p>

                    <p className="mt-3 text-xs leading-relaxed font-medium text-slate-600">{evt.desc}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 font-mono text-[11px] text-slate-400">
                    <span>Plataforma</span>
                    <span className="font-bold text-[var(--expo-navy)]">Fexpo</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
