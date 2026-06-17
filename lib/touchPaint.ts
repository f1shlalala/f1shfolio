"use client";

// Global touch-paint controller for the mobile moodboard.
//
// There is no cursor on a touchscreen, so the cursor-driven DissolveImage effect
// is dead on mobile. Instead, a single set of *passive* window listeners tracks
// the active finger and notifies whichever registered tile sits under it: drag a
// finger across the grid and each tile blooms (ASCII -> photo) as it passes
// beneath your thumb; hold still and it fills in place (tap-to-bloom for free).
//
// It also marks the tile figure under the finger with an `is-touched` class so
// hover-only reveals (the caption, the image scale) fire on touch for *every*
// tile, not just the ones with a WebGL dissolve.
//
// Passive throughout — we never preventDefault, so native scrolling is never
// blocked. elementFromPoint means only the tile under the finger (and the one it
// just left) is woken, not all of them, so idle WebGL tiles stay asleep.

export type PaintPoint = { clientX: number; clientY: number } | null;
type Cb = (p: PaintPoint) => void;

const registry = new Map<HTMLElement, Cb>();
let lastEl: HTMLElement | null = null;        // last painted dissolve wrapper
let lastFigure: HTMLElement | null = null;    // last touched tile figure
let installed = false;

function move(x: number, y: number) {
  const hit = document.elementFromPoint(x, y) as HTMLElement | null;

  // Caption/scale focus: every tile figure (paint or plain) gets `is-touched`
  // while the finger is over it, so hover-only reveals work on touch too.
  const figure = hit?.closest<HTMLElement>("[data-tile]") ?? null;
  if (figure !== lastFigure) {
    lastFigure?.classList.remove("is-touched");
    figure?.classList.add("is-touched");
    lastFigure = figure;
  }

  // Paint: only tiles with a registered WebGL dissolve get a brush point.
  const d = hit?.closest<HTMLElement>("[data-dissolve]") ?? null;
  const el = d && registry.has(d) ? d : null;
  if (el !== lastEl) {
    if (lastEl) registry.get(lastEl)?.(null); // let the tile we left recede
    lastEl = el;
  }
  if (el) registry.get(el)?.({ clientX: x, clientY: y });
}

function end() {
  if (lastEl) registry.get(lastEl)?.(null);
  lastEl = null;
  lastFigure?.classList.remove("is-touched");
  lastFigure = null;
}

function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) move(t.clientX, t.clientY);
    else end();
  };
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("touchend", onTouch, { passive: true });
  window.addEventListener("touchcancel", end, { passive: true });
}

// Register a tile (its wrapper, tagged [data-dissolve]) to receive paint points.
// Returns an unsubscribe for effect cleanup.
export function registerPaintTarget(el: HTMLElement, cb: Cb) {
  install();
  registry.set(el, cb);
  return () => {
    registry.delete(el);
    if (lastEl === el) lastEl = null;
  };
}
