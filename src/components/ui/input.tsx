import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-[var(--shadow-xs)]",
        "placeholder:text-slate-400 transition-all duration-150",
        "focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-mist)] focus-visible:shadow-[0_0_0_3px_var(--brand-mist)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        "hover:border-slate-300",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
