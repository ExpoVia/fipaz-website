"use client";

import { useRouter } from "next/navigation";
import { Building2, Store } from "lucide-react";

import type { PanelRole } from "@/config/panel-navigation";
import { usePanelStore } from "@/store/panel-store";

const ROLE_OPTIONS: { value: PanelRole; label: string; icon: typeof Store }[] = [
  { value: "expositor", label: "Expositor", icon: Store },
  { value: "organizador", label: "Organizador", icon: Building2 },
];

interface RoleSwitcherProps {
  className?: string;
}

export function RoleSwitcher({ className = "" }: RoleSwitcherProps) {
  const router = useRouter();
  const activeRole = usePanelStore((state) => state.activeRole);
  const setActiveRole = usePanelStore((state) => state.setActiveRole);

  function handleSelect(role: PanelRole) {
    if (role === activeRole) return;
    setActiveRole(role);
    router.push("/panel");
  }

  return (
    <div
      role="radiogroup"
      aria-label="Rol activo del panel"
      className={`inline-flex items-center gap-1 rounded-xl border-2 border-[var(--expo-navy)] bg-white p-1 ${className}`}
    >
      {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = activeRole === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => handleSelect(value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-colors ${
              selected
                ? "bg-[var(--expo-navy)] text-white"
                : "text-[var(--expo-navy)] hover:bg-[var(--expo-bg)]"
            }`}
          >
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
