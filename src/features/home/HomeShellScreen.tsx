"use client";

import { useAppShell } from "@/components/app-shell";
import { HomeScreen } from "./HomeScreen";

/** Adaptador para montar Inicio dentro del AppShell sin acoplar su UI. */
export function HomeShellScreen() {
  const { navigate } = useAppShell();

  return <HomeScreen onNavigate={navigate} />;
}
