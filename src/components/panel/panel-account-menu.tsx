"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, LogOut, UserRound } from "lucide-react";

import {
  describeRole,
  getActivePanel,
  getActiveRole,
  PANEL_LABELS,
  panelForRole,
} from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";

/**
 * Cuenta de la persona que usa el panel: con qué rol opera, cambio entre sus roles reales
 * (otra empresa, o de expositor a organizador) y cierre de sesión.
 */
export function PanelAccountMenu() {
  const router = useRouter();
  const session = useCompanyAuthStore((state) => state.session);
  const setActiveRole = useCompanyAuthStore((state) => state.setActiveRole);
  const logout = useCompanyAuthStore((state) => state.logout);
  const logoutAll = useCompanyAuthStore((state) => state.logoutAll);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!session) return null;

  const activeRole = getActiveRole(session);
  const activePanel = getActivePanel(session);

  function selectRole(roleId: string, rolePanel: "expositor" | "organizador") {
    setOpen(false);
    if (roleId === session?.activeRoleId) return;
    setActiveRole(roleId);
    // Cambiar de panel puede dejar la ruta actual sin sentido: se vuelve al resumen.
    if (rolePanel !== activePanel) router.push("/panel");
  }

  function endSession(everywhere: boolean) {
    setOpen(false);
    // PanelShell detecta que ya no hay sesión y redirige a la pantalla de acceso de este panel.
    void (everywhere ? logoutAll() : logout());
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-white px-2.5 py-1.5 text-xs font-extrabold text-[var(--expo-navy)] hover:bg-[var(--expo-bg)]"
      >
        <UserRound aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="hidden max-w-40 truncate sm:inline">
          {activePanel ? PANEL_LABELS[activePanel] : session.displayName}
          {activeRole ? ` · ${describeRole(activeRole)}` : ""}
        </span>
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-72 rounded-xl border-2 border-[var(--expo-navy)] bg-white p-2 shadow-[4px_4px_0_var(--expo-navy)]"
        >
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-black text-[var(--expo-navy)]">{session.displayName}</p>
            <p className="truncate text-xs font-medium text-slate-500">{session.email}</p>
          </div>

          {session.roles.length > 1 && (
            <div className="border-t border-[var(--expo-line)] py-1">
              <p className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Operar como</p>
              {session.roles.map((role) => {
                const rolePanel = panelForRole(role.role);
                const selected = role.id === activeRole?.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => selectRole(role.id, rolePanel)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold text-[var(--expo-navy)] hover:bg-[var(--expo-bg)]"
                  >
                    <span className="truncate">{PANEL_LABELS[rolePanel]} · {describeRole(role)}</span>
                    {selected && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--expo-blue)]" />}
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-[var(--expo-line)] pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => endSession(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold text-[var(--expo-navy)] hover:bg-[var(--expo-bg)]"
            >
              <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => endSession(true)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold text-slate-500 hover:bg-[var(--expo-bg)]"
            >
              <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
              Cerrar sesión en todos los dispositivos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
