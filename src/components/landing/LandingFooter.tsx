"use client";

import React from "react";
import Link from "next/link";
import { PixelLogo, PixelStar } from "./PixelIcons";

export function LandingFooter() {
  return (
    <footer className="border-t-2 border-[var(--expo-navy)] bg-white py-10 text-[var(--expo-navy)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <PixelLogo />
            <p className="font-mono text-xs font-bold text-slate-500">
              Eventos que te mueven.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold">
            <a href="#inicio" className="transition-colors hover:text-[var(--expo-blue)]">
              Inicio
            </a>
            <Link href="/demo" className="transition-colors hover:text-[var(--expo-blue)]">
              Demo
            </Link>
            <Link href="/panel" className="transition-colors hover:text-[var(--expo-blue)]">
              Panel
            </Link>
            <Link href="/feedback" className="transition-colors hover:text-[var(--expo-blue)]">
              Feedback
            </Link>
          </div>

          {/* Mandatory Badge Tag */}
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--expo-navy)] bg-[var(--expo-bg)] px-3 py-1 text-xs font-mono font-black shadow-[2px_2px_0_var(--expo-navy)]">
            <PixelStar className="w-3.5 h-3.5" />
            Demo conceptual · 2026
          </div>

        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs font-medium text-slate-500">
          <p>© 2026 ExpoVia. Plataforma digital para ferias y eventos físicos.</p>
        </div>
      </div>
    </footer>
  );
}
