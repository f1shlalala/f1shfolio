"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";

// Wraps an interactive element so it drifts toward the cursor while hovered and
// eases back to rest on leave (GSAP quickTo, same tracking feel as the custom
// cursor). Disabled on touch devices and when reduced motion is requested, where
// it renders as a plain static wrapper. The morph keeps [data-cursor] working
// because the translate lives on this wrapper, not the inner element.
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
  as: Tag = "span",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isTouch || reduced) return;

    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      // Cap the pull so it stays a subtle nudge, never a slide.
      const cap = 14;
      xTo(gsap.utils.clamp(-cap, cap, relX * strength));
      yTo(gsap.utils.clamp(-cap, cap, relY * strength));
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <Tag ref={ref} className={`inline-block ${className}`}>
      {children}
    </Tag>
  );
}
