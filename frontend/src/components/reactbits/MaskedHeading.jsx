import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

/**
 * MaskedHeading component with cursor-tracked parallax and GSAP reveal.
 * Clips custom graphic/texture through typography with high contrast.
 */
export function MaskedHeading({
  text = "IMMUTABLE PROVENANCE & INTEGRITY",
  tag = "h2",
  src = "/images/crypto_mesh.jpg",
  parallax = 25,
  reveal = "rise",
  duration = 1.0,
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current || parallax <= 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setOffset({
        x: nx * parallax,
        y: ny * parallax,
      });
    },
    [parallax]
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  // GSAP reveal animation on view
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    if (reveal === "rise") {
      gsap.fromTo(
        el,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          ease: "power3.out",
          scrollTrigger: undefined,
        }
      );
    }
  }, [reveal, duration]);

  const Tag = tag;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full flex items-center justify-center overflow-hidden py-2"
    >
      <Tag
        ref={textRef}
        className={`tracking-tight font-black select-none text-center transition-all ease-out duration-200 ${className}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "130% 130%",
          backgroundPosition: `calc(50% + ${offset.x}px) calc(50% + ${offset.y}px)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.25))",
          ...style,
        }}
      >
        {text}
      </Tag>
    </div>
  );
}

export default MaskedHeading;
