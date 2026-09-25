const LOCALE = "es-BO";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

/**
 * Formatea una fecha `YYYY-MM-DD` sin pasar por UTC: `new Date("2026-09-10")` se interpreta
 * como medianoche UTC y en Bolivia (UTC-4) mostraría el día anterior.
 */
export function formatDateOnly(value: string): string {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return dateFormatter.format(new Date(Number(year), Number(month) - 1, Number(day)));
}

/** Formatea un instante ISO 8601 como fecha y hora locales. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

/** Formatea un instante ISO 8601 como hora local (HH:mm). */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : timeFormatter.format(date);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPoints(value: number): string {
  return `${formatNumber(value)} pts`;
}
