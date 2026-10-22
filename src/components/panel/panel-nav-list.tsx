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
    <ul className={`flex flex-col gap-1.5 ${className}`}>
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className="panel-nav-link"
            >
              <Icon aria-hidden="true" className="h-[19px] w-[19px] shrink-0" strokeWidth={active ? 2.3 : 1.9} />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
