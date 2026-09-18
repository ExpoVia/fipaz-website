"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PixelMapPin } from "./PixelIcons";
import { Navigation, ArrowRight, Utensils, Compass, Layers, Maximize2, Sparkles } from "lucide-react";
import { ExpoInteractiveMap, expoStands } from "@/features/map";

export function MapShowcaseSection() {
  const [viewMode, setViewMode] = useState<"interactive" | "overview">("interactive");
  const [selectedStandId, setSelectedStandId] = useState<string | null>("tec-01");

  return (
    <section id="mapa" className="scroll-mt-24 bg-white py-16 md:py-24 border-t-2 border-[var(--expo-line)] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 border border-emerald-300 mb-3">
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            MAPA DIGITAL INTEGRADO
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
            Encuentra lo que buscas antes de perderte entre los pasillos.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium">
            Mapa interactivo en tiempo real con zoom, filtros por categoría, búsqueda de stands y cálculo de rutas.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode("interactive")}
            className={`inline-flex items-center gap-2 rounded-full border-2 border-[var(--expo-navy)] px-5 py-2 text-xs font-extrabold transition-all ${
              viewMode === "interactive"
                ? "bg-[var(--expo-blue)] text-white shadow-[3px_3px_0_var(--expo-navy)]"
                : "bg-white text-[var(--expo-navy)] hover:bg-slate-50"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Mapa Interactivo Vivo
          </button>

          <button
            type="button"
            onClick={() => setViewMode("overview")}
            className={`inline-flex items-center gap-2 rounded-full border-2 border-[var(--expo-navy)] px-5 py-2 text-xs font-extrabold transition-all ${
              viewMode === "overview"
                ? "bg-[var(--expo-purple)] text-white shadow-[3px_3px_0_var(--expo-navy)]"
                : "bg-white text-[var(--expo-navy)] hover:bg-slate-50"
            }`}
          >
            <Layers className="h-4 w-4" />
            Vista Panorámica Guía
          </button>

          <Link
            href="/demo/map"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-5 py-2 text-xs font-extrabold text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)] transition-all hover:bg-[#FFE066]"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Pantalla Completa
          </Link>
        </div>

        {/* Map Vector Graphic Card Box */}
        <div className="mt-10 relative rounded-3xl border-3 border-[var(--expo-navy)] bg-slate-900 p-3 sm:p-6 shadow-[10px_10px_0_var(--expo-navy)] overflow-hidden">
          
          {/* Top Bar inside Map Frame */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 text-white">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-xs font-black text-emerald-400 uppercase tracking-widest">
                {viewMode === "interactive" ? "FIPAZ 2026 — INTERACTIVE ENGINE" : "FIPAZ 2026 — VISTA PANORÁMICA"}
              </span>
            </div>

            {/* Mandatory Tag Label */}
            <span className="font-mono text-[10px] font-black uppercase text-amber-300 bg-amber-950/60 px-3 py-1 rounded-md border border-amber-500/40">
              Mapa conceptual · Datos ilustrativos
            </span>
          </div>

          {/* Map Content View */}
          <div className="relative mt-4 h-[440px] sm:h-[520px] w-full overflow-hidden rounded-2xl border-2 border-slate-700 bg-[#eef7fb]">
            
            {viewMode === "interactive" ? (
              /* Franco's Interactive Map Component */
              <div className="h-full w-full relative">
                <ExpoInteractiveMap
                  stands={expoStands}
                  selectedStandId={selectedStandId}
                  visitedStandIds={[]}
                  onSelectStand={(id) => setSelectedStandId(id)}
                  onOpenStand={(id) => setSelectedStandId(id)}
                />
              </div>
            ) : (
              /* Conceptual Panorama View */
              <div className="relative h-full w-full bg-[#0f172a] p-4 overflow-hidden">
                {/* Floor Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />

                {/* Fair Pavilions SVG & Route Visual */}
                <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Route Path (Animated Dash Line) */}
                  <path
                    d="M 80 340 Q 180 240, 280 260 T 480 180 T 650 140"
                    fill="none"
                    stroke="#62BE5A"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  <circle cx="80" cy="340" r="7" fill="#82B5E3" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="650" cy="140" r="9" fill="#FFC21A" stroke="#FFFFFF" strokeWidth="2.5" />
                </svg>

                {/* Pavilion Blocks */}
                <div className="absolute top-8 left-8 sm:left-14 rounded-xl border-2 border-sky-400/40 bg-sky-950/70 p-3 text-white backdrop-blur-xs w-36 sm:w-48 shadow-lg">
                  <span className="font-mono text-[9px] font-black uppercase tracking-wider text-sky-400">
                    PABELLÓN A
                  </span>
                  <p className="text-xs sm:text-sm font-black text-white">Tecnología e Innovación</p>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] font-mono text-sky-200">
                    <span className="bg-sky-900/60 p-1 rounded">Andes Cloud</span>
                    <span className="bg-sky-900/60 p-1 rounded">Ruta IoT</span>
                  </div>
                </div>

                <div className="absolute top-1/3 right-8 sm:right-20 rounded-xl border-2 border-emerald-400 bg-emerald-950/80 p-3 text-white backdrop-blur-xs w-44 sm:w-56 shadow-xl ring-2 ring-emerald-400/30">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black uppercase tracking-wider text-emerald-400">
                      PABELLÓN B
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm font-black text-white">Comercio & Soluciones</p>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] font-mono">
                    <span className="bg-emerald-800/80 p-1 rounded text-white font-bold border border-emerald-400">
                      ★ Vita Check
                    </span>
                    <span className="bg-emerald-900/60 p-1 rounded text-emerald-200">Bio Feria</span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-1/3 rounded-xl border-2 border-purple-400/40 bg-purple-950/70 p-3 text-white backdrop-blur-xs w-40 sm:w-52 shadow-lg">
                  <span className="font-mono text-[9px] font-black uppercase tracking-wider text-purple-400">
                    PABELLÓN C
                  </span>
                  <p className="text-xs sm:text-sm font-black text-white">Gastronomía & Servicios</p>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] font-mono text-purple-200">
                    <span className="bg-purple-900/60 p-1 rounded">Sabor Paceño</span>
                    <span className="bg-purple-900/60 p-1 rounded">Cafe Altura</span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-bold text-slate-200">
                  <Navigation className="h-3.5 w-3.5 text-sky-400" />
                  Entrada Principal
                </div>

                <div className="absolute top-6 right-6 hidden sm:flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-bold text-slate-200">
                  <Utensils className="h-3.5 w-3.5 text-amber-400" />
                  Patio de Comidas
                </div>

                <div className="absolute bottom-16 left-20 animate-bounce">
                  <div className="flex flex-col items-center">
                    <span className="bg-[var(--expo-yellow)] text-[var(--expo-navy)] font-mono text-[9px] font-black px-2 py-0.5 rounded border border-[var(--expo-navy)] shadow-xs">
                      Tu Ubicación
                    </span>
                    <PixelMapPin className="w-7 h-7" color="#FFC21A" />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom CTA Bar */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-white">
            <p className="text-xs sm:text-sm font-medium text-slate-300 text-center sm:text-left">
              Experimenta el motor de mapa interactivo completo con zoom, rutas de stands y navegación presencial en la demo móvil.
            </p>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/demo/map"
                className="inline-flex items-center gap-2 border-2 border-white bg-[var(--expo-blue)] px-5 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_#FFFFFF] transition-all hover:bg-sky-600 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Abrir mapa completo</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center gap-2 border-2 border-white bg-[var(--expo-yellow)] px-5 py-2.5 text-sm font-black text-[var(--expo-navy)] shadow-[3px_3px_0_#FFFFFF] transition-all hover:bg-[#FFE066] hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Probar demo</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
