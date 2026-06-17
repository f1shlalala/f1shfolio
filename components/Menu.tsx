"use client";

import { useEffect } from "react";
import { sections } from "@/lib/moodboard";
import { useScrollTo } from "@/lib/useScrollTo";

const links = [
  { id: "about", label: "TL;DR" },
  ...sections.map((s) => ({ id: s.id, label: s.label })),
  { id: "contact", label: "Contact" },
];

// Fullscreen overlay menu with staggered nav links. Locks scroll while open and
// smooth-scrolls to the target section on click.
export default function Menu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const scrollTo = useScrollTo();

  useEffect(() => {
    const root = document.documentElement;
    if (open) root.classList.add("lenis-stopped");
    else root.classList.remove("lenis-stopped");
    return () => root.classList.remove("lenis-stopped");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-cream transition-opacity duration-500 ease-[var(--ease-in-out-extreme)] red:bg-red ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        data-cursor
        className="link-hover absolute right-4 top-4 text-sm uppercase tracking-tight lg:right-6"
      >
        Close
      </button>

      <nav className="flex flex-col items-center gap-1">
        {links.map((link, i) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            data-cursor
            onClick={(e) => {
              scrollTo(e, `#${link.id}`);
              onClose();
            }}
            style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
            className={`link-hover text-5xl font-bold uppercase tracking-tighter transition-all duration-500 ease-[var(--ease-out-extreme)] lg:text-7xl ${
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
