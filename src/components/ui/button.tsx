import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[8px] text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-white shadow-[var(--shadow-brand)] hover:bg-[var(--brand-hover)] hover:shadow-[0_6px_20px_rgba(13,110,104,0.32)]",
        secondary:
          "bg-slate-900 text-white shadow-[var(--shadow-sm)] hover:bg-slate-800",
        outline:
          "border border-slate-200 bg-white text-slate-700 shadow-[var(--shadow-xs)] hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        soft:
          "bg-[var(--brand-mist)] text-[var(--brand-strong)] border border-[var(--brand-soft)] hover:bg-[var(--brand-soft)] hover:border-teal-200",
        danger:
          "bg-[var(--danger)] text-white shadow-[var(--shadow-sm)] hover:bg-red-700",
        "ghost-danger":
          "text-red-600 hover:bg-red-50 hover:text-red-700",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs rounded-[7px]",
        lg: "h-11 px-6 text-[15px] rounded-[10px]",
        xl: "h-12 px-8 text-base rounded-[10px]",
        icon: "h-9 w-9 rounded-[8px]",
        "icon-sm": "h-7 w-7 rounded-[6px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";
