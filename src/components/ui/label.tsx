import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[13px] font-semibold tracking-wide text-slate-700", className)}
      {...props}
    />
  );
}
