"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { RoleSwitcher } from "./role-switcher";

interface PanelNavbarProps {
  onMenuClick: () => void;
}

export function PanelNavbar({ onMenuClick }: PanelNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-2 border-[var(--expo-line)] bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir navegación del panel"
          className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] p-2 text-[var(--expo-navy)] hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <BrandMark compact className="lg:hidden" />
        <BrandMark className="hidden lg:inline-flex" />
      </div>

      <div className="hidden lg:block">
        <RoleSwitcher />
      </div>

      <Link
        href="/"
        className="text-xs font-bold text-[var(--expo-blue)] hover:underline"
      >
        Volver al sitio
      </Link>
    </header>
  );
}
