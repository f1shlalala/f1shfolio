"use client";

import { useCallback, useEffect, useState } from "react";
import Preloader from "./Preloader";

// Shows the intro preloader once per browser session (and never under
// reduced-motion). Rendered client-side only — the server renders nothing, so
// there's no hydration mismatch and returning visitors go straight to the page.
export default function IntroGate() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const seen = sessionStorage.getItem("intro-seen");
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!seen && !reduced) setShow(true);
    } catch {
      // sessionStorage blocked — just skip the intro rather than risk a loop.
    }
  }, []);

  // Drop the pre-hydration black cover the moment the curtain starts lifting —
  // the preloader panel is still fully covering at that point, so the reveal
  // stays seamless (the panel, not the static cover, is what lifts away).
  const onHandoff = useCallback(() => {
    document.documentElement.classList.remove("intro-pending");
  }, []);

  const onComplete = useCallback(() => {
    setShow(false);
    document.documentElement.classList.remove("intro-pending");
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
  }, []);

  if (!mounted || !show) return null;
  return <Preloader onHandoff={onHandoff} onComplete={onComplete} />;
}
