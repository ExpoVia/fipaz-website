"use client";

import { useState } from "react";
import { Gift, MapPinned, Trophy } from "lucide-react";

import { AppShell, type AppShellScreens } from "@/components/app-shell";
import { ModulePlaceholder } from "@/components/shared";
import { ExploreShellScreen } from "@/features/explore";
import { HomeShellScreen } from "@/features/home";
import { MissionsScreen } from "@/features/missions/MissionsScreen";
import { NfcShellScreen } from "@/features/nfc";
import { ProfileShellScreen } from "@/features/profile";
import { RewardsScreen } from "@/features/rewards/RewardsScreen";

type GamificationView = "missions" | "rewards";

function GamificationHub() {
  const [view, setView] = useState<GamificationView>("missions");

  return (
    <div className="min-h-full bg-[var(--expo-bg)]">
      <div className="sticky top-0 z-20 border-b-2 border-[var(--expo-line)] bg-white/95 px-4 py-3 backdrop-blur">
        <div
          className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-bg)] p-1.5 shadow-[3px_3px_0_var(--expo-navy)]"
          role="tablist"
          aria-label="Misiones y premios"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "missions"}
            onClick={() => setView("missions")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition-colors ${
              view === "missions"
                ? "bg-[var(--expo-purple)] text-white"
                : "text-[var(--expo-navy)] hover:bg-white"
            }`}
          >
            <Trophy aria-hidden="true" size={17} />
            Misiones
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "rewards"}
            onClick={() => setView("rewards")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition-colors ${
              view === "rewards"
                ? "bg-[var(--expo-pink)] text-[var(--expo-navy)]"
                : "text-[var(--expo-navy)] hover:bg-white"
            }`}
          >
            <Gift aria-hidden="true" size={17} />
            Premios
          </button>
        </div>
      </div>

      <div role="tabpanel">
        {view === "missions" ? <MissionsScreen /> : <RewardsScreen />}
      </div>
    </div>
  );
}

/**
 * Client-side demo app wrapper.
 * Mounts Zustand store and wires screens that need client interactivity.
 * Screens that don't need the store are passed as static JSX.
 */
export function DemoAppClient() {
  const screens: AppShellScreens = {
    home: <HomeShellScreen />,
    explore: <ExploreShellScreen />,
    map: (
      <ModulePlaceholder
        eyebrow="Croquis interactivo"
        title="Encuentra cada experiencia"
        description="El mapa de Franco ocupará este panel con zoom, zonas, filtros y rutas simuladas."
        icon={<MapPinned aria-hidden="true" size={25} strokeWidth={2.5} />}
        accent="green"
      >
        <div className="pixel-card relative h-80 overflow-hidden bg-[#e8f7ee] p-4">
          <div className="absolute left-5 top-6 h-24 w-32 rounded-xl border-4 border-white bg-[var(--expo-sky)] shadow-[3px_3px_0_#2f2d4c33]" />
          <div className="absolute right-5 top-10 h-36 w-32 rounded-xl border-4 border-white bg-[var(--expo-green)] shadow-[3px_3px_0_#2f2d4c33]" />
          <div className="absolute bottom-7 left-10 h-28 w-36 rounded-xl border-4 border-white bg-[var(--expo-yellow)] shadow-[3px_3px_0_#2f2d4c33]" />
          <div className="absolute bottom-8 right-7 grid size-12 place-items-center rounded-full border-4 border-white bg-[var(--expo-blue)] text-white shadow-md">
            <MapPinned aria-hidden="true" size={22} />
          </div>
          <span className="pixel-label absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-2 text-[var(--expo-navy)] shadow-md">
            Mapa demo
          </span>
        </div>
      </ModulePlaceholder>
    ),
    scan: <NfcShellScreen />,
    missions: <GamificationHub />,
    profile: <ProfileShellScreen />,
  };

  return <AppShell screens={screens} />;
}
