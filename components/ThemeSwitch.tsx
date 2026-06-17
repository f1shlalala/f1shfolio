"use client";

import { useEffect, useState } from "react";

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

  function apply(t: Theme) {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {}
    setTheme(t);
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          data-cursor
          aria-label={`${t} theme`}
          aria-pressed={theme === t}
          onClick={() => apply(t)}
          className={`h-3.5 w-3.5 rounded-full border border-current transition-transform duration-300 ease-[var(--ease-out-extreme)] ${
            swatch[t]
          } ${theme === t ? "scale-100" : "scale-75 opacity-40"}`}
        />
      ))}
    </div>
  );
}
