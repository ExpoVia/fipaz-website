"use client";

import { motion } from "motion/react";

import {
  DEMO_NAVIGATION,
  type DemoNavigationItem,
  type DemoTab,
} from "@/config/navigation";

interface BottomNavigationProps {
  activeTab: DemoTab;
  onNavigate: (tab: DemoTab) => void;
}

const spring = { type: "spring", stiffness: 520, damping: 32, mass: 0.7 } as const;

// Simetría por construcción: mitad de las pestañas a cada lado del botón
// central, que ocupa una columna fija de ancho constante.
const barItems = DEMO_NAVIGATION.filter((item) => item.placement !== "header");
const featuredItem = barItems.find((item) => item.featured);
const sideItems = barItems.filter((item) => !item.featured);
const half = Math.ceil(sideItems.length / 2);
const leftItems = sideItems.slice(0, half);
const rightItems = sideItems.slice(half);

interface NavItemProps {
  item: DemoNavigationItem;
  isActive: boolean;
  onNavigate: (tab: DemoTab) => void;
}

function NavItem({ item, isActive, onNavigate }: NavItemProps) {
  const Icon = item.icon;

  return (
    <motion.button
      type="button"
      className={`app-nav-item ${isActive ? "is-active" : ""}`}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      onClick={() => onNavigate(item.id)}
      whileTap={{ scale: 0.92 }}
      transition={spring}
    >
      <motion.span
        className="app-nav-pill"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.6 }}
        transition={spring}
      />
      <motion.span
        className="app-nav-icon"
        aria-hidden="true"
        initial={false}
        animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.12 : 1 }}
        transition={spring}
      >
        <Icon size={22} strokeWidth={2.4} />
      </motion.span>
      <span className="app-nav-label">{item.shortLabel}</span>
      <motion.span
        className="app-nav-active-dot"
        aria-hidden="true"
        initial={false}
        animate={{ width: isActive ? 15 : 0, opacity: isActive ? 1 : 0 }}
        transition={spring}
      />
    </motion.button>
  );
}

export function BottomNavigation({
  activeTab,
  onNavigate,
}: BottomNavigationProps) {
  const FeaturedIcon = featuredItem?.icon;

  return (
    <nav className="app-bottom-nav" aria-label="Navegación principal de la demo">
      <div className="app-nav-row">
        <div className="app-nav-group">
          {leftItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {featuredItem && FeaturedIcon && (
          <div className="app-nav-center">
            <button
              type="button"
              className={`app-nav-item app-nav-item-featured ${
                activeTab === featuredItem.id ? "is-active" : ""
              }`}
              aria-label={featuredItem.label}
              aria-current={activeTab === featuredItem.id ? "page" : undefined}
              onClick={() => onNavigate(featuredItem.id)}
            >
              <span className="app-nav-icon" aria-hidden="true">
                <span className="app-nav-fab">
                  <FeaturedIcon size={26} strokeWidth={2.4} />
                </span>
              </span>
              <span className="app-nav-label">{featuredItem.shortLabel}</span>
            </button>
          </div>
        )}

        <div className="app-nav-group">
          {rightItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
