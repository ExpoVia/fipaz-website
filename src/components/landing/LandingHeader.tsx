"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PixelLogo } from "./PixelIcons";
import { Menu, X, ArrowRight } from "lucide-react";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "¿Qué es ExpoVia?", href: "#problema" },
    { name: "Cómo funciona", href: "#como-funciona" },
    { name: "Mapa", href: "#mapa" },
    { name: "Para expositores", href: "#expositores" },
    { name: "Para organizadores", href: "#organizadores" },
    { name: "Contacto", href: "#contacto" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[var(--expo-line)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        {/* Brand Logo */}
        <Link href="#inicio" className="group flex items-center transition-transform hover:scale-105">
          <PixelLogo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center space-x-1 lg:flex xl:space-x-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              aria-current={link.href === "#inicio" ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-bold transition-colors hover:bg-[var(--expo-bg)] hover:text-[var(--expo-blue)] ${link.href === "#inicio" ? "bg-[var(--expo-bg)] text-[var(--expo-blue)]" : "text-[var(--expo-navy)]"}`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-5 py-2.5 text-sm font-extrabold text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5 hover:bg-[#FFE066] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Probar demo
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1 border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-3 py-1.5 text-xs font-black text-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)]"
          >
            Demo
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] p-2 text-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] hover:bg-slate-100"
            aria-label="Alternar menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-b-2 border-[var(--expo-navy)] bg-white px-4 pt-2 pb-6 shadow-lg animate-in slide-in-from-top-2 lg:hidden">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-bold text-[var(--expo-navy)] hover:bg-[var(--expo-bg)] hover:text-[var(--expo-blue)]"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3">
              <Link
                href="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] py-3 text-center text-base font-black text-[var(--expo-navy)] shadow-[4px_4px_0_var(--expo-navy)]"
              >
                Probar demo
                <ArrowRight className="h-5 w-5 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
