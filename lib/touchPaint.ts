"use client";

// Global touch-paint controller for the mobile moodboard.
//
// There is no cursor on a touchscreen, so the cursor-driven DissolveImage effect
// is dead on mobile. Instead, a single set of *passive* window listeners tracks
// the active finger and notifies whichever registered tile sits under it: drag a
// finger across the grid and each tile blooms (ASCII -> photo) as it passes
// beneath your thumb; hold still and it fills in place (tap-to-bloom for free).
//
// Passive throughout — we never preventDefault, so native scrolling is never
// blocked. elementFromPoint means only the tile under the finger (and the one it
// just left) is woken, not all of them, so idle WebGL tiles stay asleep.

export type PaintPoint = { clientX: number; clientY: number } | null;
type Cb = (p: PaintPoint) => void;

const registry = new Map<HTMLElement, Cb>();
let lastEl: HTMLElement | null = null;
let installed = false;

function resolve(x: number, y: number): HTMLElement | null {
  const hit = document.elementFromPoint(x, y) as HTMLElement | null;
  const el = hit?.closest<HTMLElement>("[data-dissolve]") ?? null;
  return el && registry.has(el) ? el : null;
}

function move(x: number, y: number) {
  const el = resolve(x, y);
  if (el !== lastEl) {
    if (lastEl) registry.get(lastEl)?.(null); // let the tile we left recede
    lastEl = el;
  }
  if (el) registry.get(el)?.({ clientX: x, clientY: y });
}

function end() {
  if (lastEl) registry.get(lastEl)?.(null);
  lastEl = null;
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
