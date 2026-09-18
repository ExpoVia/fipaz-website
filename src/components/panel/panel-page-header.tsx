interface PanelPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PanelPageHeader({ eyebrow, title, description }: PanelPageHeaderProps) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="pixel-label text-[var(--expo-blue)]">{eyebrow}</p>}
      <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--expo-navy)] sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 max-w-2xl text-sm text-slate-600 font-medium">{description}</p>
      )}
    </div>
  );
}
