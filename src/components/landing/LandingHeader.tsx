"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LogIn } from "lucide-react";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "¿Qué es Fexpo?", href: "#problema" },
    { name: "Cómo funciona", href: "#como-funciona" },
    { name: "Mapa", href: "#mapa" },
    { name: "Para expositores", href: "#expositores" },
    { name: "Para organizadores", href: "#organizadores" },
    { name: "Contacto", href: "#escribenos" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--expo-line)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        {/* Brand Logo */}
        <Link href="#inicio" aria-label="Fexpo, ir al inicio" className="group flex items-center transition-transform hover:scale-105">
          <Image
            src="/img/landing/fexpo-logo.png"
            alt="Fexpo"
            width={1254}
            height={380}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 text-sm font-bold lg:flex xl:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              aria-current={link.href === "#inicio" ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-bold transition-colors xl:px-3 hover:bg-[var(--expo-bg)] hover:text-[var(--expo-blue)] ${link.href === "#inicio" ? "bg-[var(--expo-bg)] text-[var(--expo-blue)]" : "text-[var(--expo-navy)]"}`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden items-center lg:flex">
          <Link
            href="/panel"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[var(--expo-yellow)] px-5 py-2 text-sm font-bold text-[var(--expo-navy)] shadow-[0_8px_18px_-8px_rgba(255,194,26,0.75)] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#FFE066] active:translate-y-0 active:scale-[0.97]"
          >
            <LogIn className="h-4 w-4 stroke-[2.5]" />
            <span className="text-sm font-bold">Login</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/panel"
            className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-xl bg-[var(--expo-yellow)] px-3 py-1.5 text-xs font-bold text-[var(--expo-navy)] shadow-[0_6px_14px_-6px_rgba(255,194,26,0.75)] transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <LogIn className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="text-xs font-bold">Login</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[var(--expo-navy)] shadow-sm transition-colors hover:bg-slate-50"
            aria-label="Alternar menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-b border-[var(--expo-line)] bg-white px-4 pt-2 pb-6 shadow-lg animate-in slide-in-from-top-2 lg:hidden">
          <div className="flex flex-col space-y-2 text-base font-bold">
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
            <div className="flex flex-col gap-3 pt-3">
              <Link
                href="/panel"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--expo-yellow)] py-3 text-center text-base font-bold text-[var(--expo-navy)] shadow-[0_8px_18px_-8px_rgba(255,194,26,0.75)] transition-transform duration-150 ease-out active:scale-[0.98]"
              >
                <LogIn className="h-5 w-5 stroke-[2.5]" />
                <span className="text-base font-bold">Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
