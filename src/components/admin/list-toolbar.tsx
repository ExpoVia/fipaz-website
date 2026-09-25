import type { ReactNode } from "react";
import { Search } from "lucide-react";

import type { SelectOption } from "./form-fields";

const CONTROL =
  "h-11 w-full rounded-xl border-2 border-slate-300 bg-white text-sm font-medium text-[var(--expo-navy)] placeholder:text-slate-500 focus:border-[var(--expo-blue)]";

/** Barra superior de un listado: buscador, filtros y contador de resultados. */
export function ListToolbar({ children, summary }: { children: ReactNode; summary?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">{children}</div>
      {summary && (
        <p role="status" className="shrink-0 pb-2.5 text-xs font-bold text-slate-600">
          {summary}
        </p>
      )}
    </div>
  );
}

interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchField({ label, value, onChange, placeholder }: SearchFieldProps) {
  return (
    <label className="block min-w-0 flex-1 sm:min-w-64">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-600">{label}</span>
      <span className="relative block">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${CONTROL} pl-9 pr-3`}
        />
      </span>
    </label>
  );
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SelectOption & { value: T }>;
}

export function FilterSelect<T extends string>({ label, value, onChange, options }: FilterSelectProps<T>) {
  return (
    <label className="block sm:w-48">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={`${CONTROL} px-3`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
