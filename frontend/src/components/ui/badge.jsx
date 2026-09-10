import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-neutral-900 text-white",
        secondary:
          "border-neutral-200 bg-neutral-100 text-neutral-800",
        outline:
          "border-neutral-200 bg-transparent text-neutral-700",
        admin:
          "border-neutral-300 bg-neutral-100 text-neutral-900",
        manager:
          "border-neutral-300 bg-neutral-100 text-neutral-900",
        auditor:
          "border-neutral-300 bg-neutral-100 text-neutral-900",
        user:
          "border-neutral-200 bg-neutral-100 text-neutral-700",
        active:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        inactive:
          "border-neutral-200 bg-neutral-100 text-neutral-600",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({ className, variant, children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "admin" && <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />}
      {variant === "manager" && <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />}
      {variant === "auditor" && <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />}
      {variant === "active" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {variant === "destructive" && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
      {children}
    </div>
  );
}
