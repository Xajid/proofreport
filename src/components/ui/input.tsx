import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] placeholder:text-slate-400 transition focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
