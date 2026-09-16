"use client";

import { DEMO_NAVIGATION, type DemoTab } from "@/config/navigation";

interface BottomNavigationProps {
  activeTab: DemoTab;
  onNavigate: (tab: DemoTab) => void;
}

export function BottomNavigation({
  activeTab,
  onNavigate,
}: BottomNavigationProps) {
  return (
    <nav className="app-bottom-nav" aria-label="Navegación principal de la demo">
      <div className="grid grid-cols-6 items-end gap-1 px-2 pt-2">
        {DEMO_NAVIGATION.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={
                item.featured
                  ? `app-nav-item app-nav-item-featured ${
                      isActive ? "is-active" : ""
                    }`
                  : `app-nav-item ${isActive ? "is-active" : ""}`
              }
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <span className="app-nav-icon" aria-hidden="true">
                <Icon size={item.featured ? 25 : 22} strokeWidth={2.4} />
              </span>
              <span className="app-nav-label">{item.shortLabel}</span>
              {isActive && !item.featured && (
                <span className="app-nav-active-dot" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
