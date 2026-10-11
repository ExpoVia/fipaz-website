"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { PixelNfcPlaque, PixelStar, PixelRewardChest } from "./PixelIcons";
import { Zap, Sparkles, Award } from "lucide-react";
import { DEMO_FIXTURE } from "@/data/demo-fixture";
import { pixelifyFont } from "./fonts";
import { UI_OUT, depthLayers, revealHeading, useScrollFx } from "./scroll-fx";
import fx from "./landing-fx.module.css";

/**
 * The check-in plays as you scroll: each step lights up in order along a rail, which is the mechanism the section
 * explains. The mission bar then fills and the reward chest drops in, the one celebratory beat on the page.
 */
function playNfc(root: HTMLElement) {
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

  const blue = getComputedStyle(document.documentElement).getPropertyValue("--expo-blue").trim() || "#1677b8";
  const list = root.querySelector<HTMLElement>("[data-fx-sequence]");
  const rail = root.querySelector<HTMLElement>("[data-fx-rail]");
  const steps = gsap.utils.toArray<HTMLElement>("[data-fx-step]", root);
  if (list && rail && steps.length) {
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: list, start: "top 88%", end: "bottom 80%", scrub: 0.6 },
    });
    timeline.fromTo(rail, { scaleY: 0 }, { scaleY: 1, duration: steps.length }, 0);
    steps.forEach((step, index) => {
      const chip = step.querySelector<HTMLElement>("[data-fx-chip]");
      timeline.fromTo(step, { opacity: 0.5 }, { opacity: 1, duration: 1 }, index);
      if (chip) timeline.fromTo(chip, { backgroundColor: "#ffffff", color: blue }, { backgroundColor: blue, color: "#ffffff", duration: 1 }, index);
    });
  }

  const columns = root.querySelector<HTMLElement>("[data-fx-columns]");
  if (columns) {
    gsap.from(columns.querySelectorAll<HTMLElement>("[data-fx-in]"), {
      x: (_index: number, element: HTMLElement) => (element.dataset.fxIn === "left" ? -60 : 60),
      opacity: 0,
      duration: 0.9,
      ease: UI_OUT,
      stagger: 0.08,
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: columns, start: "top 82%", once: true },
    });
  }

  const fill = root.querySelector<HTMLElement>("[data-fx-progress]");
  const label = root.querySelector<HTMLElement>("[data-fx-progress-label]");
  if (fill && label) {
    const counter = { value: 0 };
    const trigger = { trigger: fill, start: "top 92%", once: true };
    gsap.fromTo(
      fill,
      { clipPath: "inset(0 100% 0 0 round 999px)" },
      { clipPath: "inset(0 33.33% 0 0 round 999px)", duration: 1.5, ease: UI_OUT, delay: 0.3, scrollTrigger: trigger },
    );
    gsap.to(counter, {
      value: 67,
      duration: 1.5,
      ease: UI_OUT,
      delay: 0.3,
      scrollTrigger: trigger,
      onUpdate: () => {
        label.textContent = `${Math.round(counter.value)}%`;
      },
    });
  }

  const chest = root.querySelector<HTMLElement>("[data-fx-chest]");
  if (chest) {
    gsap.from(chest, {
      y: -70,
      rotate: -16,
      scale: 0.85,
      opacity: 0,
      duration: 1.1,
      ease: "back.out(2.2)",
      delay: 0.5,
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: chest, start: "top 90%", once: true },
    });
  }

  depthLayers(root);
  return stopHeading;
}

export function NfcSection() {
  const root = useRef<HTMLElement>(null);
  useScrollFx(root, playNfc);

  const nfcSequence = [
    { step: "01", text: "Acerca tu teléfono", desc: "Paso ilustrativo; no activa el NFC del dispositivo.", color: "bg-sky-50 border-sky-200" },
    { step: "02", text: "NFC detectado (simulado)", desc: "La demo ilustra cómo podría validarse la presencia en un stand.", color: "bg-indigo-50 border-indigo-200" },
    { step: "03", text: "Visita de ejemplo", desc: "El check-in se muestra en el historial de demostración.", color: "bg-emerald-50 border-emerald-200" },
    {
      step: "04",
      text: `+${DEMO_FIXTURE.points.perNewVisit} puntos de ejemplo`,
      desc: `Regla ilustrativa: una visita nueva suma ${DEMO_FIXTURE.points.perNewVisit}; repetirla suma ${DEMO_FIXTURE.points.duplicateVisit}.`,
      color: "bg-amber-50 border-amber-200",
    },
  ];

  return (
    <section ref={root} className="relative overflow-hidden border-t-2 border-[var(--expo-line)] bg-[var(--expo-bg)] py-20 md:py-28">
      <div aria-hidden="true" data-fx-depth="30" className={`${fx.dots} pointer-events-none absolute inset-x-0 -top-24 -bottom-24`} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <div
            data-fx-intro
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-[var(--expo-mint)]/40 px-3.5 py-1 text-xs font-black tracking-wider text-emerald-900 uppercase"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-700" />
            INTERACCIÓN SIMULADA
          </div>

          <h2
            data-fx-heading
            className={`${pixelifyFont.className} text-4xl leading-[1.15] font-bold tracking-tight text-balance text-[var(--expo-navy)] sm:text-5xl lg:text-6xl`}
          >
            Check-in y puntos de ejemplo.
          </h2>

          <p data-fx-intro className="mx-auto mt-6 max-w-2xl text-base font-medium text-slate-700 sm:text-lg">
            Una demostración del recorrido que podría ofrecer ExpoVia durante una feria.
          </p>

          {/* Mandatory tag label */}
          <div data-fx-intro className="mt-5 inline-block">
            <span className="rounded border-2 border-[var(--expo-navy)] bg-white px-3 py-1 font-mono text-[11px] font-black text-[var(--expo-navy)] uppercase shadow-[2px_2px_0_var(--expo-navy)]">
              Datos de demostración
            </span>
          </div>
        </div>

        {/* Two columns */}
        <div data-fx-columns className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left: NFC sequence */}
          <div data-fx-in="left" className="lg:col-span-6">
            <div className={`${fx.slab} rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 [--slab-offset:9px]`}>
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <PixelNfcPlaque className="h-10 w-10" />
                  <div>
                    <h3 className="text-lg font-black text-[var(--expo-navy)]">Secuencia de Check-in NFC</h3>
                    <p className="font-mono text-xs text-slate-500">PLACA ILUSTRATIVA · SIN NFC ACTIVO</p>
                  </div>
                </div>
                <span className="rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  SIMULACIÓN
                </span>
              </div>

              {/* 4 sequence steps, joined by a rail that fills as the check-in advances */}
              <div data-fx-sequence className="relative mt-5">
                <span aria-hidden="true" className="absolute top-6 bottom-6 left-[27px] w-1 rounded-full bg-slate-200">
                  <span data-fx-rail className="block h-full origin-top rounded-full bg-[var(--expo-blue)]" />
                </span>

                <div className="relative space-y-3">
                  {nfcSequence.map((item, idx) => (
                    <div
                      key={item.step}
                      data-fx-step
                      className={`${fx.step} relative flex items-start gap-3 rounded-xl border-2 p-3.5 ${item.color}`}
                    >
                      <span
                        data-fx-chip
                        className={`${fx.chip} rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-sm font-black text-[var(--expo-blue)] shadow-xs`}
                      >
                        {item.step}
                      </span>
                      <div className="flex-1">
                        <h4 className="flex items-center gap-1.5 text-sm font-black text-[var(--expo-navy)]">
                          {item.text}
                          {idx === 3 && <PixelStar className="h-4 w-4" />}
                        </h4>
                        <p className="mt-0.5 text-xs font-medium text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: mission and reward */}
          <div className="space-y-8 lg:col-span-6">
            <div data-fx-in="right">
              <div className={`${fx.slab} rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 [--slab-offset:9px]`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[var(--expo-purple)]" />
                    <span className="font-mono text-xs font-black text-[var(--expo-purple)] uppercase">MISIÓN DE EJEMPLO</span>
                  </div>
                  <span className="rounded border border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-2.5 py-0.5 font-mono text-xs font-extrabold text-[var(--expo-navy)]">
                    2 / 3 stands
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-black text-[var(--expo-navy)]">Ruta FIPAZ</h3>

                <p className="mt-1 text-xs font-medium text-slate-600">
                  {DEMO_FIXTURE.mission.description} Cada primera visita suma {DEMO_FIXTURE.points.perNewVisit} puntos; repetirla suma{" "}
                  {DEMO_FIXTURE.points.duplicateVisit}.
                </p>

                {/* Progress bar: the gradient is revealed, never stretched */}
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-bold text-slate-700">
                    <span>Progreso de visitas</span>
                    <span data-fx-progress-label className="tabular-nums">
                      67%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full border border-slate-300 bg-slate-100">
                    <div
                      data-fx-progress
                      className="h-full w-full rounded-full bg-gradient-to-r from-[var(--expo-blue)] via-[var(--expo-purple)] to-[var(--expo-lilac)]"
                      style={{ clipPath: "inset(0 33.33% 0 0 round 999px)" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div data-fx-in="right">
              <div
                className={`${fx.slab} ${fx.rewardCard} rounded-2xl border-3 border-[var(--expo-navy)] bg-[#fdeef4] p-6 [--slab-offset:9px]`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1 rounded border border-[var(--expo-navy)] bg-white px-2 py-0.5 font-mono text-[10px] font-black text-[var(--expo-purple)] uppercase">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      PROPUESTA DE RECOMPENSA
                    </div>
                    <h4 className="text-lg font-black text-[var(--expo-navy)]">
                      Propuesta: {DEMO_FIXTURE.stands[0].promotion} en {DEMO_FIXTURE.stands[0].name} · {DEMO_FIXTURE.stands[0].boothCode}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-slate-700">Premio ilustrativo, sin cupón válido ni canje confirmado.</p>
                  </div>

                  <span data-fx-chest className="ml-2 shrink-0">
                    <span className={`${fx.chest} inline-flex`}>
                      <PixelRewardChest className="h-12 w-12 drop-shadow-[2px_2px_0_var(--expo-navy)]" />
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div data-fx-in="right">
              <div className={`${fx.slab} rounded-xl border-2 border-[var(--expo-navy)] bg-white p-4 [--slab-lift:2px] [--slab-offset:4px]`}>
                <p className="text-sm leading-snug font-bold text-slate-800">
                  “Cada visita puede convertirse en progreso, descubrimiento y una nueva razón para seguir explorando el recinto.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
