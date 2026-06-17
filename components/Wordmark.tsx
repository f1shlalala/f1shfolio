"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Hero wordmark intro: each glyph slides up from below its clipped line on mount,
// staggered, with an extreme ease-out. Reduced-motion shows it settled.
export default function Wordmark({ text = "STUDIO" }: { text?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const letters = el.querySelectorAll<HTMLElement>("[data-letter]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(letters, { yPercent: 0 });
      return;
    }
    gsap.fromTo(
      letters,
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.06,
        delay: 0.15,
      },
    );
  }, []);

  return (
    <h1
      ref={ref}
      aria-label={text}
      className="select-none text-[18vw] font-bold leading-none tracking-tighter"
    >
      {text.split("").map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-x-visible overflow-y-clip align-bottom"
        >
          <span data-letter className="inline-block">
            {c}
          </span>
        </span>
      ))}
      <sup className="align-super text-[3vw] text-red">®</sup>
    </h1>
  );
}
