"use client";

import { useState } from "react";
import Menu from "./Menu";
import ThemeSwitch from "./ThemeSwitch";
import Magnetic from "./Magnetic";
import { profile, sections } from "@/lib/moodboard";
import { useScrollTo } from "@/lib/useScrollTo";
import { useActiveSection } from "@/lib/useActiveSection";

// Sticky top bar: name · section quick-links (desktop) · theme switch · Menu.
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = useScrollTo();
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-cream px-4 py-4 lg:px-6 dark:bg-black red:bg-cream">
        <a
          href="#about"
          data-cursor
          onClick={(e) => scrollTo(e, "#about")}
          className="text-base font-medium uppercase tracking-tight"
        >
          {profile.name}
          <span className="text-red">®</span>
        </a>

        <nav className="flex items-center gap-4 text-sm uppercase tracking-tight lg:gap-6">
          <ul className="hidden items-center gap-6 lg:flex">
            {sections.map((s) => (
              <li key={s.id}>
                <Magnetic>
                  <a
                    href={`#${s.id}`}
                    data-cursor
                    onClick={(e) => scrollTo(e, `#${s.id}`)}
                    aria-current={active === s.id ? "true" : undefined}
                    className={`link-hover transition-opacity duration-300 ${
                      active === s.id ? "is-active" : "opacity-60"
                    }`}
                  >
                    {s.label}
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
          <ThemeSwitch />
          <Magnetic>
            <button
              type="button"
              data-cursor
              onClick={() => setMenuOpen(true)}
              className="link-hover uppercase"
            >
              Menu
            </button>
          </Magnetic>
        </nav>
      </header>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
