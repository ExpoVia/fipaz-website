"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "./theme-context";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill" | "segmented";
}

export function ThemeToggle({ className = "", variant = "icon" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder to preserve layout without hydration shift
    return (
      <div
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] opacity-70 ${className}`}
        aria-hidden="true"
      >
        <span className="h-4 w-4 rounded-full bg-[var(--border)]" />
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Cambiar tema. Modo actual: ${resolvedTheme === "dark" ? "oscuro" : "claro"}`}
        className={`group inline-flex items-center gap-2 rounded-xl border border-[#d8e5ec] bg-white px-3 py-2 text-xs font-bold text-[#2f2d4c] shadow-sm transition-[border-color,background-color,color,transform] hover:border-[#1479F5] hover:text-[#1479F5] active:scale-95 dark:border-[#223354] dark:bg-[#101A2E] dark:text-[#F5F9FF] dark:hover:border-[#1479F5] dark:hover:text-[#A9D0FF] ${className}`}
      >
        {resolvedTheme === "dark" ? (
          <>
            <Sun className="h-4 w-4 text-[#FFCA35] transition-transform duration-300 group-hover:rotate-45" />
            <span>Modo claro</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-[#1479F5] transition-transform duration-300 group-hover:-rotate-12" />
            <span>Modo oscuro</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Seleccionar tema visual"
        className={`inline-flex items-center rounded-xl border border-[#d8e5ec] bg-[#f1f6fd] p-1 dark:border-[#223354] dark:bg-[#16233D] ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-checked={theme === "light"}
          role="radio"
          title="Modo claro"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] ${
            theme === "light"
              ? "bg-white text-[#1677b8] shadow-sm dark:bg-[#101A2E] dark:text-[#1479F5]"
              : "text-[#62749b] hover:text-[#17254a] dark:text-[#B8C7E6] dark:hover:text-[#F5F9FF]"
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
          <span className="sr-only">Claro</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          aria-checked={theme === "system"}
          role="radio"
          title="Automático (sistema)"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] ${
            theme === "system"
              ? "bg-white text-[#1677b8] shadow-sm dark:bg-[#101A2E] dark:text-[#1479F5]"
              : "text-[#62749b] hover:text-[#17254a] dark:text-[#B8C7E6] dark:hover:text-[#F5F9FF]"
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          <span className="sr-only">Automático</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-checked={theme === "dark"}
          role="radio"
          title="Modo oscuro"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] ${
            theme === "dark"
              ? "bg-white text-[#1479F5] shadow-sm dark:bg-[#101A2E] dark:text-[#A9D0FF]"
              : "text-[#62749b] hover:text-[#17254a] dark:text-[#B8C7E6] dark:hover:text-[#F5F9FF]"
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="sr-only">Oscuro</span>
        </button>
      </div>
    );
  }

  // Default: compact icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${resolvedTheme === "dark" ? "claro" : "oscuro"}`}
      title={`Cambiar a modo ${resolvedTheme === "dark" ? "claro" : "oscuro"}`}
      className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8e5ec] bg-white text-[#2f2d4c] shadow-sm transition-[border-color,background-color,color,transform] duration-150 hover:border-[#1479F5] hover:text-[#1479F5] active:scale-95 dark:border-[#223354] dark:bg-[#101A2E] dark:text-[#F5F9FF] dark:hover:border-[#1479F5] dark:hover:text-[#A9D0FF] ${className}`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4 text-[#FFCA35] transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-[#1677b8] transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
