"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { PixelMapPin } from "./PixelIcons";
import { Navigation, ArrowRight, Utensils, Compass, Layers, Maximize2, Sparkles } from "lucide-react";
import { ExpoInteractiveMap, expoStands } from "@/features/map";
import { headingFont } from "./fonts";
import { UI_OUT, disposer, magnetic, revealHeading, useScrollFx } from "./scroll-fx";
import fx from "./landing-fx.module.css";

/** The frame rises, then the map "opens" from its centre like a screen switching on. */
function playMap(root: HTMLElement, finePointer: boolean) {
  const cleanup = disposer();
  const heading = root.querySelector<HTMLElement>("[data-fx-heading]");
  if (heading) cleanup.add(revealHeading(heading));

  gsap.from(root.querySelectorAll("[data-fx-intro]"), {
    y: 22,
    opacity: 0,
    duration: 0.7,
    ease: UI_OUT,
    stagger: 0.08,
    delay: 0.15,
    scrollTrigger: { trigger: root, start: "top 78%", once: true },
  });

  const frame = root.querySelector<HTMLElement>("[data-fx-frame]");
  const screen = root.querySelector<HTMLElement>("[data-fx-screen]");
  if (frame && screen) {
    const timeline = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 82%", once: true } });
    timeline
      .from(frame, { y: 80, opacity: 0, duration: 0.9, ease: UI_OUT, clearProps: "transform,opacity" })
      .fromTo(
        screen,
        { clipPath: "inset(50% 50% 50% 50% round 16px)" },
        { clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1.1, ease: UI_OUT, clearProps: "clipPath" },
        0.25,
      )
      .from(root.querySelectorAll("[data-fx-bar]"), { opacity: 0, y: 10, duration: 0.5, ease: UI_OUT, stagger: 0.08 }, 0.55);
  }

  if (finePointer) {
    root.querySelectorAll<HTMLElement>("[data-fx-magnet]").forEach((item) => cleanup.add(magnetic(item, 0.22)));
  }
  return cleanup.run;
}

const toggleBase = `${fx.slab} ${fx.press} inline-flex min-h-11 items-center gap-2 rounded-full border border-black/5 px-5 py-2 [--slab-lift:2px] [--slab-offset:6px] dark:border-[#223354]`;

export function MapShowcaseSection() {
  const root = useRef<HTMLElement>(null);
  const [viewMode, setViewMode] = useState<"interactive" | "overview">("interactive");
  const [selectedStandId, setSelectedStandId] = useState<string | null>("tec-01");
  useScrollFx(root, playMap);

  return (
    <section
      ref={root}
      id="mapa"
      className="relative scroll-mt-24 overflow-hidden border-t border-[var(--expo-line)] bg-white py-20 md:py-28 dark:border-[#223354] dark:bg-[#0B1220]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <div
            data-fx-intro
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3.5 py-1 text-xs font-black tracking-wider text-emerald-800 uppercase dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
          >
            <Compass className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            MAPA DE DEMOSTRACIÓN
          </div>

          <h2
            data-fx-heading
            className={`${headingFont.className} text-4xl leading-[1.15] font-bold tracking-tight text-balance text-[var(--expo-navy)] sm:text-5xl lg:text-6xl dark:text-[#F5F9FF]`}
          >
            Explora un plano de referencia para FIPAZ 2026.
          </h2>

          <p data-fx-intro className="mx-auto mt-6 max-w-2xl text-base font-medium text-slate-600 sm:text-lg dark:text-[#B8C7E6]">
            El mapa permite probar zoom, filtros, búsqueda y rutas ilustrativas. Las ubicaciones no son asignaciones confirmadas de FIPAZ.
          </p>
        </div>

        {/* View mode toggle */}
        <div data-fx-intro className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            aria-pressed={viewMode === "interactive"}
            onClick={() => setViewMode("interactive")}
            className={`${toggleBase} ${
              viewMode === "interactive" ? "bg-[var(--expo-blue)] text-white dark:bg-[#1479F5]" : "bg-white text-[var(--expo-navy)] hover:bg-slate-50 dark:bg-[#101A2E] dark:text-[#F5F9FF] dark:hover:bg-[#16233D]"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-extrabold">Mapa Interactivo de Ejemplo</span>
          </button>

          <button
            type="button"
            aria-pressed={viewMode === "overview"}
            onClick={() => setViewMode("overview")}
            className={`${toggleBase} ${
              viewMode === "overview" ? "bg-[var(--expo-purple)] text-white dark:bg-[#6851ea]" : "bg-white text-[var(--expo-navy)] hover:bg-slate-50 dark:bg-[#101A2E] dark:text-[#F5F9FF] dark:hover:bg-[#16233D]"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span className="text-xs font-extrabold">Vista Panorámica Guía</span>
          </button>

          <Link
            href="/demo/map"
            className={`${toggleBase} bg-[var(--expo-yellow)] text-[var(--expo-navy)] hover:bg-[#FFE066] dark:bg-[#FFCA35] dark:text-[#0B1220]`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="text-xs font-extrabold">Pantalla Completa</span>
          </Link>
        </div>

        {/* Map frame: the section's one peak */}
        <div data-fx-frame className="mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-3 shadow-[0_40px_90px_-30px_rgba(15,23,42,0.55)] sm:p-6 dark:border dark:border-[#223354]">
            {/* Top bar inside the frame */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 text-white">
              <div data-fx-bar className="flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />
                <span className="font-mono text-xs font-black tracking-widest text-emerald-400 uppercase">
                  {viewMode === "interactive" ? "FIPAZ 2026 — MAPA DE EJEMPLO" : "FIPAZ 2026 — PLANO REFERENCIAL"}
                </span>
              </div>

              {/* Mandatory tag label */}
              <span
                data-fx-bar
                className="rounded-md border border-amber-500/40 bg-amber-950/60 px-3 py-1 font-mono text-[10px] font-black text-amber-300 uppercase"
              >
                Datos de demostración · Ubicaciones ficticias
              </span>
            </div>

            {/* Map content */}
            <div
              data-fx-screen
              className="relative mt-4 h-[min(560px,78svh)] w-full overflow-hidden rounded-2xl border-2 border-slate-700 bg-[#eef7fb] sm:h-[520px] dark:border-[#223354] dark:bg-[#101A2E]"
            >
              {viewMode === "interactive" ? (
                <div className="relative h-full w-full">
                  <ExpoInteractiveMap
                    stands={expoStands}
                    selectedStandId={selectedStandId}
                    visitedStandIds={[]}
                    onSelectStand={(id) => setSelectedStandId(id)}
                    onOpenStand={(id) => setSelectedStandId(id)}
                    embedded
                  />
                </div>
              ) : (
                /* Static Overview Map Representation */
                <div className="relative h-full w-full bg-slate-950 p-6 text-white overflow-hidden">
                  <svg className="absolute inset-0 h-full w-full opacity-15" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern-dark" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern-dark)" />
                  </svg>

                  {/* Visual pavilion blocks */}
                  <div
                    className={`${fx.pavilion} absolute top-12 left-10 w-44 rounded-xl border-2 border-sky-400/40 bg-sky-950/70 p-3 text-white shadow-lg backdrop-blur-xs sm:w-56`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-black tracking-wider text-sky-400 uppercase">PABELLÓN A</span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400 motion-reduce:animate-none" />
                    </div>
                    <p className="text-xs font-black text-white sm:text-sm">Innovación & Tecnología</p>
                    <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[9px]">
                      <span className="rounded border border-sky-400 bg-sky-800/80 p-1 font-bold text-white">★ TechBol</span>
                      <span className="rounded bg-sky-900/60 p-1 text-sky-200">Andes Cloud</span>
                    </div>
                  </div>

                  <div
                    className={`${fx.pavilion} absolute top-12 right-10 w-44 rounded-xl border-2 border-emerald-400/40 bg-emerald-950/70 p-3 text-white shadow-lg backdrop-blur-xs sm:w-56`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-black tracking-wider text-emerald-400 uppercase">PABELLÓN B</span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />
                    </div>
                    <p className="text-xs font-black text-white sm:text-sm">Comercio & Soluciones</p>
                    <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[9px]">
                      <span className="rounded border border-emerald-400 bg-emerald-800/80 p-1 font-bold text-white">★ Vita Check</span>
                      <span className="rounded bg-emerald-900/60 p-1 text-emerald-200">Bio Feria</span>
                    </div>
                  </div>

                  <div
                    className={`${fx.pavilion} absolute bottom-6 left-1/3 w-40 rounded-xl border-2 border-purple-400/40 bg-purple-950/70 p-3 text-white shadow-lg backdrop-blur-xs sm:w-52`}
                  >
                    <span className="font-mono text-[9px] font-black tracking-wider text-purple-400 uppercase">PABELLÓN C</span>
                    <p className="text-xs font-black text-white sm:text-sm">Gastronomía & Servicios</p>
                    <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[9px] text-purple-200">
                      <span className="rounded bg-purple-900/60 p-1">Sabor Paceño</span>
                      <span className="rounded bg-purple-900/60 p-1">Cafe Altura</span>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200">
                    <Navigation className="h-3.5 w-3.5 text-sky-400" />
                    Entrada Principal
                  </div>

                  <div className="absolute top-6 right-6 hidden items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200 sm:flex">
                    <Utensils className="h-3.5 w-3.5 text-amber-400" />
                    Patio de Comidas
                  </div>

                  <div className={`absolute bottom-16 left-20 ${fx.float}`}>
                    <div className="flex flex-col items-center">
                      <span className="rounded border border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-2 py-0.5 font-mono text-[9px] font-black text-[var(--expo-navy)] shadow-xs dark:border-[#223354] dark:bg-[#FFCA35] dark:text-[#0B1220]">
                        Punto simulado
                      </span>
                      <PixelMapPin className="h-7 w-7" color="#FFC21A" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom CTA bar */}
            <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-4 text-white sm:flex-row">
              <p data-fx-bar className="text-center text-xs font-medium text-slate-300 sm:text-left sm:text-sm">
                Prueba el zoom, los filtros y las rutas ilustrativas del mapa de demostración.
              </p>

              <div className="flex shrink-0 flex-wrap items-center gap-4">
                <span data-fx-magnet className="inline-block">
                  <Link
                    href="/demo/map"
                    className={`${fx.slab} ${fx.press} inline-flex items-center gap-2 rounded-xl bg-[var(--expo-blue)] px-5 py-2.5 text-white [--slab-color:rgba(0,0,0,0.4)] [--slab-lift:2px] [--slab-offset:6px] hover:bg-sky-600 dark:bg-[#1479F5]`}
                  >
                    <span className="text-sm font-black">Abrir mapa completo</span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </Link>
                </span>

                <span data-fx-magnet className="inline-block">
                  <Link
                    href="/demo"
                    className={`${fx.slab} ${fx.press} inline-flex items-center gap-2 rounded-xl bg-[var(--expo-yellow)] px-5 py-2.5 text-[var(--expo-navy)] [--slab-color:rgba(0,0,0,0.3)] [--slab-lift:2px] [--slab-offset:6px] hover:bg-[#FFE066] dark:bg-[#FFCA35] dark:text-[#0B1220]`}
                  >
                    <span className="text-sm font-black">Probar demo</span>
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
