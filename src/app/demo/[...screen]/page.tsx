import { notFound } from "next/navigation";
import { MobileDemo } from "@/features/mobile-demo/MobileDemo";
import { findStand } from "@/features/mobile-demo/catalog";
import { EVENTS } from "@/features/mobile-demo/events";
import { mobileMapStands } from "@/features/mobile-demo/map-catalog";
import type { Screen, View } from "@/features/mobile-demo/types";

const views: Record<string, View> = { scan: "scan", "check-in": "scan", missions: "missions", profile: "profile", stands: "stands", "my-qr": "qr", rewards: "rewards", explore: "stands" };
export default async function DemoScreenPage({ params }: { params: Promise<{ screen: string[] }> }) {
  const { screen } = await params;
  let initialScreen: Screen;
  if (screen.length === 2 && screen[0] === "stands" && (findStand(screen[1]) || mobileMapStands.some((stand) => stand.id === screen[1] && stand.demo))) initialScreen = { view: "stand", id: screen[1] };
  else if (screen.length === 2 && screen[0] === "events" && EVENTS.some((event) => event.id === screen[1])) initialScreen = { view: "event", id: screen[1] };
  else if (screen.length === 1 && views[screen[0]]) initialScreen = { view: views[screen[0]] };
  else notFound();
  return <MobileDemo initialScreen={initialScreen} />;
}
