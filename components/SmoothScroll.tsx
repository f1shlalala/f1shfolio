"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Lenis smooth scroll, driven by the GSAP ticker so any GSAP-based motion stays
// frame-synced with scroll. Matches the original's lenis defaults.
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        syncTouch: false,
        autoRaf: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
