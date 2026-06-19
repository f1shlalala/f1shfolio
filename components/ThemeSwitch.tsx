"use client";

import { useEffect, useState } from "react";
import Magnetic from "./Magnetic";

const THEMES = ["cream", "dark", "red"] as const;
type Theme = (typeof THEMES)[number];

const swatch: Record<Theme, string> = {
  cream: "bg-cream",
  dark: "bg-black",
  red: "bg-red",
};

// Three buttons that set <html data-theme> and persist to localStorage.
export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("cream");

  useEffect(() => {
    const saved = document.documentElement.dataset.theme as Theme | undefined;
    if (saved && THEMES.includes(saved)) setTheme(saved);
  }, []);

  function applyDom(t: Theme) {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {}
    setTheme(t);
  }

  function apply(t: Theme, e: React.MouseEvent) {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (doc.startViewTransition && !reduced) {
      // Circular reveal of the new theme from the clicked swatch.
      document.documentElement.style.setProperty("--vt-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--vt-y", `${e.clientY}px`);
      doc.startViewTransition(() => applyDom(t));
    } else {
      applyDom(t);
    }
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <Magnetic key={t} strength={0.5}>
          <button
            type="button"
            data-cursor
            aria-label={`${t} theme`}
            aria-pressed={theme === t}
            onClick={(e) => apply(t, e)}
            className={`h-3.5 w-3.5 rounded-full border border-current transition-transform duration-300 ease-[var(--ease-out-extreme)] ${
              swatch[t]
            } ${theme === t ? "scale-100" : "scale-75 opacity-40"}`}
          />
        </Magnetic>
      ))}
    </div>
  );
}
