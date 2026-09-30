"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Loader2, Lock } from "lucide-react";

import { isSessionValid, useCompanyAuthStore } from "@/store/company-auth-store";
import { usePanelStore } from "@/store/panel-store";

interface CompanyAuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

/** Guard visual del área de empresa; AdminShell aplica el guard a todo /admin/*. */
export function CompanyAuthGuard({ children, redirectTo = "/registro-empresa" }: CompanyAuthGuardProps) {
  const router = useRouter();
  const hasHydrated = useCompanyAuthStore((state) => state.hasHydrated);
  const panelHydrated = usePanelStore((state) => state.hasHydrated);
  const session = useCompanyAuthStore((state) => state.session);
  const verifySession = useCompanyAuthStore((state) => state.verifySession);
  const logout = useCompanyAuthStore((state) => state.logout);
  const valid = isSessionValid(session);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!session) {
      router.replace(redirectTo);
      return;
    }
    let cancelled = false;
    void verifySession().then((isValid) => {
      if (cancelled) return;
      if (isValid) setVerified(true);
      else {
        logout();
        router.replace(redirectTo);
      }
    });
    return () => { cancelled = true; };
  }, [hasHydrated, session?.accessToken, verifySession, logout, router, redirectTo]);

  if (!hasHydrated || !panelHydrated || !verified || (session && !valid)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-bold">Verificando sesión de empresa…</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-coral)] shadow-[4px_4px_0_var(--expo-navy)]">
          <Lock className="h-7 w-7 text-white" />
        </span>
        <p className="font-black text-[var(--expo-navy)]">Acceso restringido</p>
        <p className="text-sm text-slate-500">Redirigiendo al registro…</p>
      </div>
    );
  }

  return <>{children}</>;
}
