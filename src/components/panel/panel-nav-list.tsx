"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PanelNavigationItem } from "@/config/panel-navigation";

interface PanelNavListProps {
  items: readonly PanelNavigationItem[];
  onNavigate?: () => void;
  className?: string;
}

function isItemActive(pathname: string, href: string): boolean {
  return href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
}

export function PanelNavList({ items, onNavigate, className = "" }: PanelNavListProps) {
  const pathname = usePathname();

  return (
    <ul className={`flex flex-col gap-1 ${className}`}>
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[3px_3px_0_var(--expo-navy)]"
                  : "border-transparent text-[var(--expo-navy)] hover:bg-[var(--expo-bg)]"
              }`}
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
