import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[8px] text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_2px_rgba(15,23,42,0.18)] hover:bg-[var(--brand-strong)]",
        secondary:
          "bg-slate-900 text-white hover:bg-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.12)]",
        outline:
          "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        soft: "bg-[var(--brand-mist)] text-[var(--brand-strong)] hover:bg-[var(--brand-soft)]",
        danger: "bg-[var(--danger)] text-white hover:bg-red-800",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5 text-[15px]",
        icon: "h-9 w-9",
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
