import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { differenceInCalendarDays, subDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function apiErrorMessage(err: unknown, fallback = "Invalid request"): string {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    if (!first) return fallback;
    const field = first.path.length ? `${first.path.join(".")}: ` : "";
    return `${field}${first.message}`;
  }
  return err instanceof Error ? err.message : fallback;
}

export function parsePeriodDate(input: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    // Midday UTC avoids off-by-one display shifts across UTC-11..UTC+11 timezones
    // while preserving inclusive period overlap comparisons.
    return new Date(`${input}T12:00:00.000Z`);
  }
  return new Date(input);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

/** Previous window of the same length, ending the day before `start`. */
export function previousPeriod(start: Date, end: Date): { prevStart: Date; prevEnd: Date } {
  const days = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, days - 1);
  return { prevStart, prevEnd };
}

export function periodLabel(start: Date | string, end: Date | string): string {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}
