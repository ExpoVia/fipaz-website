"use client";

import React from "react";
import { motion } from "motion/react";
import { Search, Map, Navigation, Smartphone, Gift, Users, ChevronDown } from "lucide-react";
import { PixelStar } from "./PixelIcons";

export function SolutionSection() {
  const steps = [
    {
      name: "Buscar",
      desc: "Encuentra empresas por categoría o nombre.",
      icon: <Search className="h-5 w-5 text-white" />,
      color: "bg-[var(--expo-blue)]",
    },
    {
      name: "Ver mapa",
      desc: "Consulta la ubicación de referencia en un plano de ejemplo.",
      icon: <Map className="h-5 w-5 text-white" />,
      color: "bg-[var(--expo-purple)]",
    },
    {
      name: "Llegar",
      desc: "Prueba un recorrido ilustrativo por los pasillos.",
      icon: <Navigation className="h-5 w-5 text-white" />,
      color: "bg-[var(--expo-lilac)]",
    },
    {
      name: "Tocar NFC",
      desc: "La demo simula un check-in; no valida una visita real.",
      icon: <Smartphone className="h-5 w-5 text-[var(--expo-navy)]" />,
      color: "bg-[var(--expo-mint)]",
    },
    {
      name: "Ganar",
      desc: "Explora una misión y puntos de ejemplo, sin sincronización en vivo.",
      icon: <Gift className="h-5 w-5 text-[var(--expo-navy)]" />,
      color: "bg-[var(--expo-yellow)]",
    },
    {
      name: "Conectar",
      desc: "Revisa información ficticia de las empresas del guion.",
      icon: <Users className="h-5 w-5 text-white" />,
      color: "bg-[var(--expo-coral)]",
    },
  ];

  return (
    <section className="bg-[var(--expo-bg)] py-16 md:py-24 border-t-2 border-[var(--expo-line)] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-[var(--expo-purple)] bg-purple-50 px-3 py-1 rounded-full border border-purple-200 mb-3">
            <PixelStar className="w-3.5 h-3.5" />
            DATOS DE DEMOSTRACIÓN · EXPOVIA
          </span>

          <h2 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
            Del descubrimiento a la conexión, en un solo recorrido.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-700 font-medium">
            Una secuencia fluida e intuitiva diseñada para que cada interacción física tenga valor digital inmediato.
          </p>
        </div>

        {/* Horizontal Flow Container (Desktop) / Vertical (Mobile) */}
        <div className="mt-14">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-3">
            {steps.map((step, index) => (
              <React.Fragment key={step.name}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative flex flex-col justify-between rounded-xl border-2 border-[var(--expo-navy)] bg-white p-4 shadow-[4px_4px_0_var(--expo-navy)] transition-all hover:-translate-y-1"
                >
                  <div>
                    {/* Step Icon */}
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] ${step.color} shadow-[2px_2px_0_var(--expo-navy)]`}>
                        {step.icon}
                      </div>
                      <span className="font-mono text-xs font-black text-slate-400">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-[var(--expo-navy)]">
                      {step.name}
                    </h3>

                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>

                  {/* Flow Arrow Indicator inside card on mobile */}
                  {index < steps.length - 1 && (
                    <div className="mt-3 flex justify-center lg:hidden">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
