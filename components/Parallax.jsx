"use client";

import { useEffect, useRef } from "react";

// Moves its children a few pixels opposite to the mouse for a depth effect.
export default function Parallax({ depth = 14, className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -depth;
        const y = (e.clientY / window.innerHeight - 0.5) * -depth;
        if (ref.current) ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [depth]);

  return (
    <div ref={ref} className={`transition-transform duration-300 ease-out ${className}`}>
      {children}
    </div>
  );
}
