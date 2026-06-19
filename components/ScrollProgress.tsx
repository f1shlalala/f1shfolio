"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";

// Slim progress line pinned to the very top edge, scaled by Lenis scroll
// progress. Sits above the header (z-50) as a hairline.
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useLenis((lenis) => {
    const el = ref.current;
    if (el) el.style.transform = `scaleX(${lenis.progress || 0})`;
  });

  return (
    <div
      aria-hidden
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-red"
    />
  );
}
