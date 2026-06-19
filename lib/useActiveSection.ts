"use client";

import { useEffect, useState } from "react";

// Scroll-spy: returns the id of the section currently crossing a thin band near
// the top-middle of the viewport. Used to highlight the active nav link.
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("");
  const key = ids.join(",");

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Shrink the root to a band ~40–55% down the viewport so "active" is
      // whatever section is centered, not just barely on screen.
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
