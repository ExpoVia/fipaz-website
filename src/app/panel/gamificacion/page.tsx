import type { Metadata } from "next";
import { Trophy } from "lucide-react";

import { missions, rewards } from "@/data/demo-data";
import { PanelPageHeader } from "@/components/panel";

export const metadata: Metadata = { title: "Gamificación" };

export default function GamificacionPage() {
  const rewardById = new Map(rewards.map((reward) => [reward.id, reward]));

  return (
    <>
      <PanelPageHeader
        eyebrow="Organizador"
        title="Campañas de gamificación"
        description="Misiones y recompensas activas para dinamizar el recorrido del evento."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {missions.map((mission) => {
          const reward = rewardById.get(mission.rewardId);
          return (
            <div key={mission.id} className="pixel-card flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <Trophy aria-hidden="true" className="h-4 w-4 text-[var(--expo-yellow)]" />
                <h3 className="font-black text-[var(--expo-navy)]">{mission.title}</h3>
              </div>
              <p className="text-sm text-slate-600">{mission.description}</p>
              <p className="text-xs font-bold text-slate-500">
                {mission.requiredVisits} visitas requeridas · {mission.standIds.length} stands elegibles
              </p>
              {reward && (
                <p className="mt-1 text-xs font-bold text-[var(--expo-blue)]">
                  Premio: {reward.name} ({reward.requiredPoints} pts)
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
