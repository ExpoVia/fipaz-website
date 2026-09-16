import { categories } from "@/data/demo-data";
import type { StandCategory } from "@/types/demo";

interface StandCategoryBadgeProps {
  category: StandCategory;
  className?: string;
}

const categoryById = new Map(categories.map((category) => [category.id, category]));

/**
 * Badge de categoría para el catálogo de stands de la demo (`@/data/demo-data`).
 * No confundir con `CategoryBadge`, que usa el catálogo de misiones.
 */
export function StandCategoryBadge({ category, className = "" }: StandCategoryBadgeProps) {
  const meta = categoryById.get(category);
  const label = meta?.label ?? category;
  const color = meta?.colorToken ?? "var(--expo-navy)";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold ${className}`}
      style={{ color, background: `color-mix(in srgb, ${color} 15%, white)` }}
    >
      {label}
    </span>
  );
}
