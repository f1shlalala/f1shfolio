"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Intro preloader: "TAUSIF HASAN" drawn as a pixel/block grid on a black field.
// Cells flicker on in random order; a red caret blinks like a terminal cursor.
// Handoff is a transform-only "curtain up": the black panel (name riding inside
// it) slides up and off the top, with a full-width red seam on its bottom edge
// sweeping up the whole screen and away — the red bar jumps to the top and goes
// away — revealing the landing (the F1sh hero plays its slide-up in sync).
//
// onHandoff fires as the curtain starts lifting (parent starts the hero then).
// onComplete fires when the overlay is fully gone (parent unmounts the preloader).

// 5x5 block font for the glyphs we need. "█" = filled cell.
const FONT: Record<string, string[]> = {
  T: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
  A: [" ███ ", "█   █", "█████", "█   █", "█   █"],
  U: ["█   █", "█   █", "█   █", "█   █", " ███ "],
  S: [" ████", "█    ", " ███ ", "    █", "████ "],
  I: ["█████", "  █  ", "  █  ", "  █  ", "█████"],
  F: ["█████", "█    ", "████ ", "█    ", "█    "],
  H: ["█   █", "█   █", "█████", "█   █", "█   █"],
  N: ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
};

// Compose a word into 5 row-strings, 1 empty column between letters.
function buildWord(word: string): string[] {
  const rows = ["", "", "", "", ""];
  const letters = word.split("");
  letters.forEach((ch, li) => {
    const g = FONT[ch];
    for (let r = 0; r < 5; r++) {
      rows[r] += g[r] + (li < letters.length - 1 ? " " : "");
    }
  });
  return rows;
}

function Word({ rows }: { rows: string[] }) {
  const cols = rows[0].length;
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, var(--cell))`,
        gap: "calc(var(--cell) * 0.16)",
      }}
    >
      {rows.flatMap((row, r) =>
        row.split("").map((c, ci) => {
          const filled = c === "█";
          return (
            <div
              key={`${r}-${ci}`}
              data-fill={filled ? "1" : "0"}
              // Start hidden so the name doesn't flash at full opacity before
              // GSAP (which runs after first paint) flickers the cells in.
              className={filled ? "bg-cream opacity-0" : "opacity-0"}
              style={{ width: "var(--cell)", height: "var(--cell)" }}
            />
          );
        }),
      )}
    </div>
  );
}

export default function Preloader({
  onHandoff,
  onComplete,
}: {
  onHandoff?: () => void;
  onComplete?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onHandoff?.();
      onComplete?.();
      return;
    }

    const cells = gsap.utils.toArray<HTMLElement>('[data-fill="1"]', root);
    const caret = caretRef.current;
    const seam = seamRef.current;
    const panel = panelRef.current;
    gsap.set(cells, { opacity: 0, scale: 0.3 });
    gsap.set(caret, { opacity: 0 });
    gsap.set(seam, { opacity: 0 });

    let skipped = false;
    const tl = gsap.timeline();

    // 1) Random flicker-on. Per-cell pop keeps its original speed (duration);
    //    only the stagger spread is tightened to shorten the overall sequence.
    tl.to(cells, {
      opacity: 1,
      scale: 1,
      duration: 0.16,
      ease: "power2.out",
      stagger: { each: 0.002, from: "random" },
    });
    // 2) Caret arrives and blinks like a terminal cursor. Same blink speed,
    //    fewer cycles so we don't linger on the hold.
    tl.to(caret, { opacity: 1, duration: 0.08 }, "-=0.2");
    tl.to(caret, { opacity: 0.12, duration: 0.34, ease: "steps(1)", repeat: 0, yoyo: true });

    // 3) Handoff — curtain up. The red hands off from the blinking caret to the
    //    seam on the panel's bottom edge, then the whole panel (name inside)
    //    slides up and off the top; the seam sweeps up the screen and away.
    tl.addLabel("handoff");
    tl.to(caret, { opacity: 0, duration: 0.18 }, "handoff");
    tl.to(seam, { opacity: 1, duration: 0.12 }, "handoff");
    // Reveal + start the landing hero just before the lift, so F1sh is already
    // rising as the curtain clears.
    tl.add(() => onHandoff?.(), "handoff+=0.1");
    // The curtain (and the name riding inside it) lifts up and off the top.
    tl.to(
      panel,
      { yPercent: -100, duration: 0.65, ease: "power3.inOut" },
      "handoff+=0.15",
    );
    tl.add(() => onComplete?.());

    // Skip on any interaction: fast-forward straight to the handoff.
    const skip = () => {
      if (skipped) return;
      skipped = true;
      tl.seek("handoff");
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });

    return () => {
      tl.kill();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
  }, [onHandoff, onComplete]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] overflow-hidden">
      {/* The curtain: black panel + the name ride up together as one transform. */}
      <div ref={panelRef} className="absolute inset-0 bg-black">
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-[2vmin]"
          style={{ ["--cell" as string]: "clamp(4px, 2.1vw, 13px)" }}
        >
          <Word rows={buildWord("TAUSIF")} />
          {/* HASAN stays centered; the caret hangs off its right via absolute
              positioning so it never offsets centering or causes a reflow. */}
          <div className="relative">
            <Word rows={buildWord("HASAN")} />
            <div
              ref={caretRef}
              className="absolute left-full top-0 ml-[var(--cell)] bg-red opacity-0"
              style={{ width: "var(--cell)", height: "calc(var(--cell) * 5)" }}
            />
          </div>
        </div>
        {/* Red seam on the panel's bottom edge — sweeps up the screen as the
            curtain lifts, the connective line between loader and landing. */}
        <div
          ref={seamRef}
          className="absolute inset-x-0 bottom-0 bg-red opacity-0"
          style={{ height: "clamp(3px, 0.5vmin, 6px)" }}
        />
      </div>
    </div>
  );
}
