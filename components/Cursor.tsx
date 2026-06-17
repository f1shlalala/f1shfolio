"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Custom cursor: a small red dot that follows the pointer (GSAP quickTo) and
// morphs into a labelled circle over elements carrying [data-cursor].
// Disabled on touch devices and when reduced motion is requested.
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isTouch || reduced) return;

    const el = dotRef.current;
    if (!el) return;

    document.documentElement.classList.add("has-custom-cursor");
    setEnabled(true);
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = (e.target as HTMLElement | null)?.closest?.(
        "[data-cursor]",
      ) as HTMLElement | null;
      if (target) {
        setActive(true);
        setLabel(target.getAttribute("data-cursor-label") ?? "");
      } else {
        setActive(false);
        setLabel("");
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      style={{ opacity: enabled ? 1 : 0 }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
    >
      <div
        className={`flex items-center justify-center rounded-full bg-red text-[10px] font-medium uppercase leading-none tracking-wide text-cream transition-[width,height] duration-300 ease-[var(--ease-out-extreme)] ${
          active ? "h-16 w-16" : "h-3 w-3"
        }`}
      >
        <span
          className={`transition-opacity duration-200 ${
            active && label ? "opacity-100" : "opacity-0"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
