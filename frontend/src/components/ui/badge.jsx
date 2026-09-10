import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-sky-600 text-white shadow hover:bg-sky-500",
        secondary:
          "border-transparent bg-slate-800 text-slate-200 hover:bg-slate-700",
        destructive:
          "border-transparent bg-rose-500/20 text-rose-300 border-rose-500/30",
        outline: "text-slate-300 border-slate-700",
        admin:
          "bg-amber-500/15 text-amber-300 border-amber-500/30",
        manager:
          "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        auditor:
          "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        user:
          "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        active:
          "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        inactive:
          "bg-slate-500/15 text-slate-400 border-slate-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
