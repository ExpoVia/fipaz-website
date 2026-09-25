"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";

interface MobileViewportProps {
  children: ReactNode;
}

const clockFormat = new Intl.DateTimeFormat("es-BO", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function subscribeToClock(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}

export function MobileViewport({ children }: MobileViewportProps) {
  const clock = useSyncExternalStore(
    subscribeToClock,
    () => clockFormat.format(new Date()),
    () => "9:41",
  );

  return (
    <div className="app-stage">
      <div className="app-phone">
        <div className="app-device" data-testid="mobile-viewport">
          <div className="app-device-island" aria-hidden="true" />
          <div className="app-statusbar" aria-hidden="true">
            <span>{clock}</span>
            <span className="app-statusbar-icons">
              <Signal size={14} strokeWidth={2.6} />
              <Wifi size={14} strokeWidth={2.6} />
              <BatteryFull size={19} strokeWidth={2.2} />
            </span>
          </div>

          {children}

          <div className="app-home-indicator" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
