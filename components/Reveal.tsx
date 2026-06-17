"use client";

import { useEffect, useRef, useState } from "react";

// Wraps content in an IntersectionObserver that toggles an inview state once,
// fading/sliding the block up on entry. Honours reduced-motion (shows instantly).
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inview, setInview] = useState(false);

  useEffect(() => {
    // Show instantly for reduced-motion or where IntersectionObserver is missing.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setInview(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    // Fail-safe: never let content stay hidden. If the observer hasn't fired
    // (flaky scroll containers, mobile quirks, etc.), reveal anyway.
    const fallback = window.setTimeout(() => setInview(true), 1500);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInview(true);
          io.disconnect();
          window.clearTimeout(fallback);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-inview={inview}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-[var(--ease-out-extreme)] ${
        inview ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
