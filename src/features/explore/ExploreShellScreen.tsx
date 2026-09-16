"use client";

import { useAppShell } from "@/components/app-shell";
import { ExploreScreen } from "./ExploreScreen";

/** Adaptador para montar Explorar dentro del AppShell sin acoplar su UI. */
export function ExploreShellScreen() {
  const { navigate } = useAppShell();

  return <ExploreScreen onNavigate={navigate} />;
}
