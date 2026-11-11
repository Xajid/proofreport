import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-slate-200/90 bg-white p-5 shadow-[var(--shadow-sm)]",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    brand: "bg-teal-50 text-teal-800",
    success: "bg-emerald-50 text-emerald-800",
    warning: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-800",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
