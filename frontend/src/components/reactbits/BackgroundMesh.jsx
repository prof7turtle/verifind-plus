import React from "react";

/**
 * React Bits - Inspired subtle mesh & grid background for Landing/Hero.
 * Strictly scoped to the hero section for enterprise cybersecurity look.
 */
export function BackgroundMesh({ children }) {
  return (
    <div className="relative min-h-[500px] w-full overflow-hidden bg-slate-950 flex flex-col justify-center">
      {/* Subtle radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Cyber grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, #000 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, #000 70%, transparent 100%)",
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
