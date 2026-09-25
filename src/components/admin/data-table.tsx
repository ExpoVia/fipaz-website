import type { ReactNode } from "react";
import { clsx } from "clsx";

export interface DataColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Clases extra para la celda y su encabezado (alineación, ancho). */
  className?: string;
  /** Oculta el campo en la vista de tarjeta móvil (p. ej. datos redundantes). */
  hideOnCard?: boolean;
  /** En la tabla, oculta la columna por debajo de 1280 px para que las principales quepan sin scroll. */
  hideBelowXl?: boolean;
}

const HIDE_BELOW_XL = "hidden xl:table-cell";

interface DataTableProps<T> {
  /** Descripción de la tabla para lectores de pantalla. */
  caption: string;
  columns: ReadonlyArray<DataColumn<T>>;
  rows: readonly T[];
  getRowId: (row: T) => string;
  /** Contenido de la columna de acciones (menú o botones). */
  renderActions?: (row: T) => ReactNode;
  actionsHeader?: string;
  /** `menu`: icono compacto arriba a la derecha de la tarjeta; `inline`: botones en una fila propia. */
  actionsLayout?: "menu" | "inline";
}

/**
 * Tabla responsive: desde `md` es una tabla con scroll horizontal de respaldo; en móvil
 * cada fila se convierte en una tarjeta (la primera columna hace de título). Ambas vistas
 * comparten las mismas definiciones de columna, y la oculta usa `display: none` para que
 * los lectores de pantalla no lean el contenido duplicado.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  renderActions,
  actionsHeader = "Acciones",
  actionsLayout = "menu",
}: DataTableProps<T>) {
  const [primary, ...secondary] = columns;

  return (
    <>
      <div className="pixel-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead className="bg-[var(--expo-bg)]">
              <tr className="border-b-2 border-[var(--expo-line)]">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={clsx(
                      "whitespace-nowrap px-3 py-3 text-xs xl:px-4 font-black uppercase tracking-wide text-slate-600",
                      column.className,
                      column.hideBelowXl && HIDE_BELOW_XL,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                {renderActions && (
                  // Fija a la derecha: con scroll horizontal las acciones siguen a la vista.
                  <th
                    scope="col"
                    className="sticky right-0 bg-[var(--expo-bg)] px-3 py-3 text-right xl:px-4 text-xs font-black uppercase tracking-wide text-slate-600"
                  >
                    {actionsHeader}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--expo-line)]">
              {rows.map((row) => (
                <tr key={getRowId(row)} className="group hover:bg-[var(--expo-bg)]/60">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={clsx("px-3 py-3 align-middle xl:px-4", column.className, column.hideBelowXl && HIDE_BELOW_XL)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="sticky right-0 bg-white px-3 py-3 text-right xl:px-4 align-middle shadow-[-8px_0_8px_-8px_rgb(47_45_76/20%)] group-hover:bg-[var(--expo-bg)]">
                      <div className="flex items-center justify-end gap-2">{renderActions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <li key={getRowId(row)} className="pixel-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-sm font-bold text-[var(--expo-navy)]">
                {primary.cell(row)}
              </div>
              {renderActions && actionsLayout === "menu" && (
                <div className="-mr-1 -mt-1 shrink-0">{renderActions(row)}</div>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              {secondary
                .filter((column) => !column.hideOnCard)
                .map((column) => (
                  <div key={column.id} className="min-w-0">
                    <dt className="pixel-label text-slate-600">{column.header}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-[var(--expo-navy)]">{column.cell(row)}</dd>
                  </div>
                ))}
            </dl>
            {renderActions && actionsLayout === "inline" && (
              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t-2 border-[var(--expo-line)] pt-3">
                {renderActions(row)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
