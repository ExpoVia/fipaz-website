"use client";

import React from "react";
import { motion } from "motion/react";
import {
  PixelNfcPlaque,
  PixelStar,
  PixelRewardChest,
} from "./PixelIcons";
import { Zap, Sparkles, Award } from "lucide-react";
import { DEMO_FIXTURE } from "@/data/demo-fixture";

export function NfcSection() {
  const nfcSequence = [
    { step: "01", text: "Acerca tu teléfono", desc: "Paso ilustrativo; no activa el NFC del dispositivo.", color: "bg-sky-50 border-sky-200" },
    { step: "02", text: "NFC detectado (simulado)", desc: "La demo ilustra cómo podría validarse la presencia en un stand.", color: "bg-indigo-50 border-indigo-200" },
    { step: "03", text: "Visita de ejemplo", desc: "El check-in se muestra en el historial de demostración.", color: "bg-emerald-50 border-emerald-200" },
    { step: "04", text: `+${DEMO_FIXTURE.points.perNewVisit} puntos de ejemplo`, desc: `Regla ilustrativa: una visita nueva suma ${DEMO_FIXTURE.points.perNewVisit}; repetirla suma ${DEMO_FIXTURE.points.duplicateVisit}.`, color: "bg-amber-50 border-amber-200" },
  ];

  return (
    <section className="bg-[var(--expo-bg)] py-16 md:py-24 border-t-2 border-[var(--expo-line)] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--expo-mint)]/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-900 border border-emerald-300 mb-3">
            <Zap className="h-3.5 w-3.5 text-emerald-700" />
            INTERACCIÓN SIMULADA
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
            Check-in y puntos de ejemplo.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-700 font-medium">
            Una demostración del recorrido que podría ofrecer ExpoVia durante una feria.
          </p>

          {/* Mandatory Tag Label */}
          <div className="mt-4 inline-block">
            <span className="font-mono text-[11px] font-black uppercase text-[var(--expo-navy)] bg-white px-3 py-1 rounded border-2 border-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)]">
              Datos de demostración
            </span>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          
          {/* LEFT COLUMN: NFC Sequence Visual */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[7px_7px_0_var(--expo-navy)]">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <PixelNfcPlaque className="w-10 h-10" />
                  <div>
                    <h3 className="text-lg font-black text-[var(--expo-navy)]">
                      Secuencia de Check-in NFC
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      PLACA ILUSTRATIVA · SIN NFC ACTIVO
                    </p>
                  </div>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  SIMULACIÓN
                </span>
              </div>

              {/* 4 Sequence Steps */}
              <div className="mt-5 space-y-3">
                {nfcSequence.map((item, idx) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className={`flex items-start gap-3 rounded-xl border-2 p-3.5 ${item.color}`}
                  >
                    <span className="font-mono text-sm font-black text-[var(--expo-blue)] bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs">
                      {item.step}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-[var(--expo-navy)] flex items-center gap-1.5">
                        {item.text}
                        {idx === 3 && <PixelStar className="w-4 h-4" />}
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-600 font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Gamification & Mission Cards */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Active Mission Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[7px_7px_0_var(--expo-navy)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[var(--expo-purple)]" />
                  <span className="font-mono text-xs font-black uppercase text-[var(--expo-purple)]">
                    MISIÓN DE EJEMPLO
                  </span>
                </div>
                <span className="font-mono text-xs font-extrabold text-[var(--expo-navy)] bg-[var(--expo-yellow)] px-2.5 py-0.5 rounded border border-[var(--expo-navy)]">
                  2 / 3 stands
                </span>
              </div>

              <h3 className="mt-3 text-xl font-black text-[var(--expo-navy)]">
                Ruta FIPAZ
              </h3>

              <p className="mt-1 text-xs text-slate-600 font-medium">
                {DEMO_FIXTURE.mission.description} Cada primera visita suma {DEMO_FIXTURE.points.perNewVisit} puntos; repetirla suma {DEMO_FIXTURE.points.duplicateVisit}.
              </p>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Progreso de visitas</span>
                  <span>67%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-slate-300 bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--expo-blue)] via-[var(--expo-purple)] to-[var(--expo-lilac)]" style={{ width: "66.67%" }} />
                </div>
              </div>
            </motion.div>

            {/* Unlocked Reward Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border-3 border-[var(--expo-navy)] bg-[var(--expo-pink)]/20 p-6 shadow-[7px_7px_0_var(--expo-navy)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 font-mono text-[10px] font-black uppercase text-[var(--expo-purple)] bg-white px-2 py-0.5 rounded border border-[var(--expo-navy)] mb-2">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    PROPUESTA DE RECOMPENSA
                  </div>
                  <h4 className="text-lg font-black text-[var(--expo-navy)]">
                    Propuesta: {DEMO_FIXTURE.stands[0].promotion} en {DEMO_FIXTURE.stands[0].name} · {DEMO_FIXTURE.stands[0].boothCode}
                  </h4>
                  <p className="mt-1 text-xs text-slate-700 font-medium">
                    Premio ilustrativo, sin cupón válido ni canje confirmado.
                  </p>
                </div>

                <PixelRewardChest className="w-12 h-12 shrink-0 ml-2 drop-shadow-[2px_2px_0_var(--expo-navy)]" />
              </div>
            </motion.div>

            {/* Main Subtitle Box */}
            <div className="rounded-xl border-2 border-[var(--expo-navy)] bg-white p-4 shadow-[3px_3px_0_var(--expo-navy)]">
              <p className="text-sm font-bold leading-snug text-slate-800">
                “Cada visita puede convertirse en progreso, descubrimiento y una nueva razón para seguir explorando el recinto.”
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
