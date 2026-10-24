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
    <div className="mb-7">
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow && <p className="pixel-label text-[#0878f9] dark:text-[#1479F5]">{eyebrow}</p>}
        {demo && <DemoBadge />}
      </div>
      <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-[#111c3b] sm:text-[2.2rem] dark:text-[#F5F9FF]">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 max-w-2xl text-sm font-medium text-[#64799e] dark:text-[#B8C7E6]">{description}</p>
      )}
    </div>
  );
}
