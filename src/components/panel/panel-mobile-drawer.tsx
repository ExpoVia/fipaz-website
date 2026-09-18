"use client";

import { Drawer } from "vaul";

import { getPanelNavigationForRole } from "@/config/panel-navigation";
import { usePanelStore } from "@/store/panel-store";
import { PanelNavList } from "./panel-nav-list";
import { RoleSwitcher } from "./role-switcher";

interface PanelMobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PanelMobileDrawer({ open, onOpenChange }: PanelMobileDrawerProps) {
  const activeRole = usePanelStore((state) => state.activeRole);
  const items = getPanelNavigationForRole(activeRole);

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
        <Drawer.Content
          className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col gap-4 border-r-2 border-[var(--expo-navy)] bg-[var(--expo-card)] p-4 outline-none lg:hidden"
        >
          <Drawer.Title className="sr-only">Navegación del panel</Drawer.Title>
          <RoleSwitcher className="self-start" />
          <PanelNavList items={items} onNavigate={() => onOpenChange(false)} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
