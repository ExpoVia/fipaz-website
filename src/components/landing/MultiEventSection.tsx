"use client";

import React from "react";
import { motion } from "motion/react";
import { PixelStar } from "./PixelIcons";
import { Globe, MapPin } from "lucide-react";

export function MultiEventSection() {
  const events = [
    {
      name: "FIPAZ 2026",
      location: "La Paz, Bolivia",
      status: "EDICIÓN ACTUAL",
      statusColor: "bg-[var(--expo-yellow)] text-[var(--expo-navy)]",
      desc: "Feria Internacional de La Paz. Plataforma de prueba y desarrollo conceptual.",
      active: true,
    },
    {
      name: "Expocruz",
      location: "Santa Cruz, Bolivia",
      status: "PRÓXIMAMENTE",
      statusColor: "bg-sky-100 text-[var(--expo-blue)]",
      desc: "Expansión proyectada para ferias multisectoriales de gran escala.",
      active: false,
    },
    {
      name: "La Paz Expone",
      location: "La Paz, Bolivia",
      status: "PLANTILLA LISTA",
      statusColor: "bg-purple-100 text-[var(--expo-purple)]",
      desc: "Integración modular para eventos empresariales e industriales.",
      active: false,
    },
    {
      name: "Próximos Eventos",
      location: "Nivel Nacional e Internacional",
      status: "ECOSISTEMA",
      statusColor: "bg-emerald-100 text-emerald-800",
      desc: "Un solo perfil para conservar tu historial, contactos y recompensas.",
      active: false,
    },
  ];

  return (
    <section id="multi-evento" className="scroll-mt-24 bg-white py-16 md:py-24 border-t-2 border-[var(--expo-line)] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--expo-sky)]/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[var(--expo-blue)] border border-sky-300 mb-3">
            <Globe aria-hidden="true" className="h-3.5 w-3.5" />
            VISIÓN MULTI-EVENTO
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
            Un perfil. Múltiples eventos. Nuevas conexiones.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium">
            ExpoVia nace como una experiencia para ferias, pero está diseñada para acompañar al visitante y al expositor en múltiples recintos.
          </p>
        </div>

        {/* Ecosystem Connecting Line Visual */}
        <div className="relative mt-14">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-1 bg-[linear-gradient(to_right,#1677B8_0%,#B984B6_50%,#FFC21A_100%)] -translate-y-1/2 z-0" />

          {/* Cards Grid */}
          <ul className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((evt, idx) => (
              <motion.li
                key={evt.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className={`flex flex-col justify-between rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[6px_6px_0_var(--expo-navy)] transition-all hover:-translate-y-1 ${
                  evt.active ? "ring-2 ring-[var(--expo-blue)]" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className={`font-mono text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-[var(--expo-navy)] ${evt.statusColor}`}>
                      {evt.status}
                    </span>
                    {evt.active && <PixelStar className="w-4 h-4" />}
                  </div>

                  <h3 className="mt-4 text-xl font-black text-[var(--expo-navy)]">
                    {evt.name}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 font-mono text-xs font-bold text-slate-500">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-rose-500" />
                    {evt.location}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 font-medium">
                    {evt.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Plataforma</span>
                  <span className="font-bold text-[var(--expo-navy)]">ExpoVia</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
