"use client";

import React from "react";
import { motion } from "motion/react";
import { User, Store, Building2, AlertCircle } from "lucide-react";
import { PixelStar } from "./PixelIcons";

export function ProblemSection() {
  const problems = [
    {
      title: "Visitante",
      badge: "DESORIENTACIÓN",
      badgeColor: "bg-[var(--expo-pink)]",
      icon: <User className="h-6 w-6 text-[var(--expo-purple)]" />,
      problem: "No siempre sabe qué empresas existen, dónde están o cuál puede resolver lo que busca.",
      detail: "Se pierden buenas oportunidades por falta de guía clara dentro del recinto.",
    },
    {
      title: "Expositor",
      badge: "SIN SEGUIMIENTO",
      badgeColor: "bg-[var(--expo-yellow)]",
      icon: <Store className="h-6 w-6 text-[var(--expo-blue)]" />,
      problem: "Recibe visitantes, pero muchas interacciones terminan sin seguimiento ni métricas claras.",
      detail: "Dificultad para convertir el tráfico del stand en prospectos calificados.",
    },
    {
      title: "Organizador",
      badge: "FALTA DE CAPA DIGITAL",
      badgeColor: "bg-[var(--expo-mint)]",
      icon: <Building2 className="h-6 w-6 text-[var(--expo-navy)]" />,
      problem: "Gestiona espacios, expositores y actividades sin una capa digital integrada para toda la experiencia.",
      detail: "Falta de analítica en tiempo real sobre el flujo real de asistentes.",
    },
  ];

  return (
    <section id="problema" className="scroll-mt-24 relative bg-white py-16 md:py-24 border-t-2 border-[var(--expo-line)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--expo-bg)] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[var(--expo-blue)] border border-[var(--expo-line)] mb-4">
            <AlertCircle className="h-3.5 w-3.5" />
            EL DESAFÍO EN LAS FERIAS HOY
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
            Una feria llena de oportunidades no debería sentirse difícil de navegar.
          </h2>

          <p className="mt-4 text-lg text-slate-600 font-medium">
            En un evento multitudinario, la falta de una capa digital integrada genera fricción en cada paso del recorrido.
          </p>
        </div>

        {/* 3 Problem Cards */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {problems.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="group relative flex flex-col justify-between rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-7 shadow-[6px_6px_0_var(--expo-navy)] transition-all hover:-translate-y-1.5 hover:shadow-[9px_9px_0_var(--expo-navy)]"
            >
              <div>
                {/* Header card badge & icon */}
                <div className="flex items-center justify-between">
                  <div className="rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-bg)] p-3 shadow-[2px_2px_0_var(--expo-navy)]">
                    {card.icon}
                  </div>
                  <span
                    className={`inline-block border-2 border-[var(--expo-navy)] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-6 text-2xl font-black text-[var(--expo-navy)] flex items-center gap-2">
                  {card.title}
                </h3>

                {/* Problem quote */}
                <p className="mt-3 text-base font-bold leading-snug text-slate-800">
                  “{card.problem}”
                </p>

                {/* Detail */}
                <p className="mt-3 text-sm text-slate-600">
                  {card.detail}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                <span>Punto de dolor 0{idx + 1}</span>
                <PixelStar className="w-3.5 h-3.5 opacity-60" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
