"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PixelLogo, PixelStar } from "@/components/landing/PixelIcons";

export function RegistrationHeader() {
  return (
    <header className="border-b-2 border-[var(--expo-line)] bg-white py-6">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-slate-600 transition-colors hover:text-[var(--expo-blue)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>

          <PixelLogo />
        </div>

        <div className="mt-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--expo-yellow)] px-3 py-1 font-mono text-xs font-black text-[var(--expo-navy)] border-2 border-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] mb-3">
            <PixelStar className="w-3.5 h-3.5" />
            REGISTRO DE EMPRESAS
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
            Lleva tu empresa a ExpoVia.
          </h1>

          <p className="mt-3 max-w-2xl text-base font-medium text-slate-600 sm:text-lg">
            Regístrate en un par de minutos y accede al panel B2B para completar el perfil de tu stand.
          </p>
        </div>
      </div>
    </header>
  );
}
