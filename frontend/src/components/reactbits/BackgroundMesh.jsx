import React from "react";

/**
 * React Bits - Inspired subtle mesh & grid background for Landing/Hero.
 * Strictly scoped to the hero section for enterprise cybersecurity look.
 */
export function BackgroundMesh({ children }) {
  return (
    <div className="relative min-h-[460px] w-full overflow-hidden bg-white border-b border-neutral-200 flex flex-col justify-center">
      {/* Subtle geometric grid */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, #000 60%, transparent 100%)",
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
