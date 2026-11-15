import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-sm)]",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "neutral",
  dot = false,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "accent";
  dot?: boolean;
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600 border border-slate-200/80",
    brand:   "bg-teal-50 text-teal-800 border border-teal-100",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger:  "bg-red-50 text-red-700 border border-red-100",
    accent:  "bg-sky-50 text-sky-800 border border-sky-100",
  };

  const dotColors = {
    neutral: "bg-slate-400",
    brand:   "bg-teal-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger:  "bg-red-500",
    accent:  "bg-sky-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColors[tone])} />
      )}
      {props.children}
    </span>
  );
}
