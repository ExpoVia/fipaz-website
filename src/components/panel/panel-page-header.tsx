import { DemoBadge } from "@/components/shared/demo-badge";

interface PanelPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Toda pantalla del panel muestra datos de ejemplo salvo que se indique lo contrario. */
  demo?: boolean;
}

export function PanelPageHeader({ eyebrow, title, description, demo = true }: PanelPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow && <p className="pixel-label text-[var(--expo-blue)]">{eyebrow}</p>}
        {demo && <DemoBadge />}
      </div>
      <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--expo-navy)] sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 max-w-2xl text-sm text-slate-600 font-medium">{description}</p>
      )}
    </div>
  );
}
