"use client";

import { useLenis } from "lenis/react";
import { useCallback } from "react";

// Returns a click handler that smooth-scrolls to an in-page anchor through Lenis
// (so it eases instead of hard-jumping). Falls back to native scrollIntoView.
export function useScrollTo() {
  const lenis = useLenis();

  return useCallback(
    (e: React.MouseEvent, hash: string) => {
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -16 });
      else el.scrollIntoView({ behavior: "smooth" });
    },
    [lenis],
  );
}
