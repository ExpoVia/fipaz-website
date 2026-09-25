import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-xs font-bold text-slate-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="rounded underline-offset-2 hover:text-[var(--expo-blue)] hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-[var(--expo-navy)]" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface AdminPageHeaderProps {
  breadcrumbs: readonly BreadcrumbItem[];
  title: string;
  description?: string;
  /** Acción principal (p. ej. "Crear dinámica"), siempre visible junto al título. */
  actions?: ReactNode;
}

export function AdminPageHeader({ breadcrumbs, title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="mb-6">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-[var(--expo-navy)] sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm font-medium text-slate-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
