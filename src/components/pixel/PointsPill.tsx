"use client";

import { useEffect, useRef } from "react";

interface PointsPillProps {
  points: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-sm gap-1 px-2 py-1",
  md: "text-base gap-1.5 px-3 py-1.5",
  lg: "text-xl gap-2 px-4 py-2",
} as const;

/**
 * Animated points counter pill.
 * Counts up/down using requestAnimationFrame when the value changes.
 * Respects prefers-reduced-motion.
 */
export function PointsPill({ points, className = "", size = "md" }: PointsPillProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const prevPoints = useRef(points);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || prevPoints.current === points) {
      el.textContent = String(points);
      prevPoints.current = points;
      return;
    }

    const from = prevPoints.current;
    const to = points;
    prevPoints.current = to;

    const duration = 700; // ms
    const startTime = performance.now();

    // Cancel any in-progress animation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      if (el) el.textContent = String(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [points]);

  return (
    <div
      className={`inline-flex items-center rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] font-black text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)] ${sizeClasses[size]} ${className}`}
    >
      <span ref={displayRef} aria-label={`${points} puntos`}>
        {points}
      </span>
      <span className="text-xs font-bold opacity-70">pts</span>
    </div>
  );
}
