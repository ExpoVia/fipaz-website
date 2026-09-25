import type { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode;
}

/** Pares etiqueta/valor de la vista de detalle de una entidad. */
export function DetailList({ items }: { items: readonly DetailItem[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="pixel-label text-slate-600">{item.label}</dt>
          <dd className="mt-1 break-words text-sm font-bold text-[var(--expo-navy)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
