"use client";

import { AnimatePresence, motion } from "motion/react";

import { useAppShellDismissable } from "@/components/app-shell";
import type { DemoTab } from "@/config/navigation";
import { StandDetailScreen } from "../StandDetailScreen";

interface StandDetailOverlayProps {
  /** ID único por punto de montaje (Inicio, Explorar, Perfil...) para no colisionar en el stack de "dismiss". */
  dismissId: string;
  standId: string | null;
  onClose: () => void;
  onNavigate?: (tab: DemoTab) => void;
}

/** Hoja modal deslizable que muestra la ficha de un stand sobre la pantalla activa. */
export function StandDetailOverlay({ dismissId, standId, onClose, onNavigate }: StandDetailOverlayProps) {
  useAppShellDismissable(dismissId, standId !== null, onClose);

  return (
    <AnimatePresence>
      {standId && (
        <motion.div
          key={standId}
          className="fixed inset-0 z-50 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-x-0 bottom-0 flex h-[92%] flex-col overflow-hidden rounded-t-3xl bg-[var(--expo-bg)] shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <StandDetailScreen standId={standId} onClose={onClose} onNavigate={onNavigate} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
