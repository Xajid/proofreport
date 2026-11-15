import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[108px] w-full rounded-[8px] border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-[var(--shadow-xs)]",
      "placeholder:text-slate-400 resize-y transition-all duration-150",
      "focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-mist)] focus-visible:shadow-[0_0_0_3px_var(--brand-mist)]",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
      "hover:border-slate-300",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
