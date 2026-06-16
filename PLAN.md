# Build spec — clone of outfit.hellohello.is (OUTFIT® by ++hellohello)

## Context
User wants to build a website *similar* to outfit.hellohello.is with my help. This file is the
reverse-engineered spec from a deep live inspection (DOM, computed styles, live transforms, and the
minified JS bundles). It captures the exact design tokens, motion mechanics, and structure needed to
rebuild it. Final stack/scope to be confirmed with the user before implementation.

## What it is
A single-page, editorial **merch store** for a design studio (++hellohello, Montevideo UY). Minimalist
Swiss/typographic aesthetic, heavy on micro-interactions. ~13 apparel products with designer in-joke
names (Off by Design, Kerned Confidence, Specimen No. HH01, Grid System Go, Neutral Grotesk, Red Dot
Not Award, Gridlocked, Hello Week 001/002, Monochrome Manifest, Positive Space, Whitespace Matters,
Command K). $20–$36.50.

## Stack (original)
- **Next.js** (App Router, Turbopack) on Vercel · **Tailwind CSS v4** (CSS-first `@theme`, lab() colors)
- **Lenis** smooth scroll (lenis defaults: `lerp 0.1`, `smoothWheel true`, `wheelMultiplier 1`, `syncTouch false`)
- **GSAP** — drives the custom cursor, the SVG wordmark intro, and image reveal/parallax (`will-change:transform` + GSAP inline reset signature)
- React `Reveal` component wrapping an **IntersectionObserver** (`threshold`, `rootMargin`, `once`), ~0.3s reveal
- GTM analytics. No WebGL/canvas.

## Design tokens
- **Colors:** cream `#ede4dd` (= "white"), red `#ff0001` (accent + `--cursor-color`), black `#000`; neutrals as `lab()` scale.
- **Themes:** `<html data-theme>` = `cream` | `dark` | `red`, switchable via 3 buttons. Tailwind `red:` variant remaps bg/text/selection. Body: `bg-cream text-black dark:bg-black dark:text-white red:bg-cream red:text-red`.
- **Type:** **Neue Haas Grotesk Text Pro** (Regular/Medium/Bold woff2, self-hosted). Serif `Times` used sparingly. Scale `text-xs .75rem` → `text-9xl 8rem`; `tracking-tighter -.05em`.
- **Aspect ratios:** product `--aspect-large 9/12`; `--aspect-small 242/240`. Spacing unit `.25rem`.
- **Easings:** large custom library, e.g. `--ease-out-extreme cubic-bezier(.19,1,.22,1)`, `--ease-in-out-extreme cubic-bezier(.87,0,.13,1)`, `--ease-out-standard cubic-bezier(.25,1,.5,1)`, `--ease-quick-reveal cubic-bezier(.075,.82,.165,1)`.

## Motion inventory (the important part)
1. **Smooth scroll** — Lenis eases all scrolling; `<html class="lenis loaded ready has-custom-cursor">`.
2. **Custom cursor** — fixed `z-[9999] pointer-events-none` div, position set by GSAP (quickTo). Tracks `mousemove` clientX/Y with drag detection. Links carry `data-cursor="text"` to morph the cursor contextually. Color = red `#ff0001`.
3. **Wordmark intro** — "Outfit" is inline `<svg>`; each glyph `<path>` has `data-svg-origin` + GSAP matrix transform that slides/settles on load.
4. **Scroll reveals** — `<Reveal>` blocks toggle `data-inview`/`is-inview` via IntersectionObserver; images sit in `relative overflow-hidden`, GSAP animates the inner image up/clip on enter (~0.3s, `once`).
5. **Product-card hover** (signature effect) — two stacked images (`data-image="front"`/`"back"`). On `group-hover` the back image: `transition-all duration-500 ease-[cubic-bezier(.87,0,.13,1)]`, **scale `1.2→1`**, **clip-path wipe L→R** (`polygon(0 0,0 0,0 100%,0 100%)` → `polygon(0 0,100% 0,100% 100%,0 100%)`), and **filter `brightness(400%) contrast(150%)` → `brightness(100%) contrast(100%)`** (blown-out → normal). Category label ("Apparel") overlays.
6. **Link hover** — `.link-hover` uses an `::after` underline bar (~2.4px, accent color, `transition:all`) that grows in; links are `uppercase`.
7. **Fullscreen menu** — "Menu" button opens `fixed inset-0 z-50 flex items-center justify-center` overlay (`dark:bg-cream text-cream`) with nav.
8. **Theme switch** — instant `data-theme` swap with color transitions across bg/text/selection/accent.

## Page structure
Sticky top bar: `OUTFIT®` · Shop · Bag (N) · Menu → animated SVG wordmark hero → "Why" intro paragraph
→ product grid (`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6`, cards reveal on scroll) → footer
(© 2026, Montevideo Uruguay, shipping/returns, privacy, socials: Dribbble/Instagram/LinkedIn/Twitter,
studio links work/services/about/careers/contact). Routes: `/`, `/product/[slug]`, `/bag`, `/shipping-and-return`.

## Build decisions (confirmed with user)
- **Stack:** match original — Next.js (App Router) + Tailwind v4 + `lenis/react` + GSAP. Chosen for fidelity: the cursor, wordmark intro, and image reveals genuinely depend on GSAP + Lenis; CSS-only can't reproduce them faithfully.
- **Scope:** landing + product grid only — sticky header, wordmark hero, "Why" intro, product grid with hover, fullscreen menu, footer. No real cart/checkout/product pages (cards link to `#`).
- **Content:** placeholder demo — generic brand ("STUDIO®"), ~12 invented products, placeholder images, three themes.
- **Font:** free Grotesk substitute (Space Grotesk via `next/font/google`) instead of licensed Neue Haas Grotesk.

## Implementation plan
Scaffold `create-next-app` (TS, App Router, Tailwind). Then:

1. **`app/globals.css`** — Tailwind v4 `@theme`: cream/red/black colors, the custom `--ease-*` curves, `--aspect-large: 9/12`. Define `data-theme` variants (`[data-theme=dark]`, `[data-theme=red]`) and a `.link-hover` `::after` underline utility. Import Space Grotesk via `next/font`.
2. **`components/SmoothScroll.tsx`** — `'use client'` wrapper using `ReactLenis` (root) with `lerp 0.1`, hooked to GSAP ticker so reveals stay in sync.
3. **`components/Cursor.tsx`** — `'use client'`; fixed `z-[9999]` dot, `gsap.quickTo` follow on `mousemove`; grows/labels when hovering `[data-cursor]` elements; hidden on touch + `prefers-reduced-motion`.
4. **`components/Reveal.tsx`** — IntersectionObserver (`once`, threshold ~0.15); adds `is-inview`; child image animates clip/translate via GSAP (~0.3s, `ease-out-extreme`).
5. **`components/Wordmark.tsx`** — inline SVG title; GSAP staggers each glyph path up on mount.
6. **`components/ProductCard.tsx`** — two stacked images (front/back); back image Tailwind classes for the signature hover: `scale-[1.2] group-hover:scale-100`, clip-path wipe, `brightness(400%) contrast(150%)`→normal, `duration-500 ease-[cubic-bezier(.87,0,.13,1)]`. Category label overlay.
7. **`components/Header.tsx` + `Menu.tsx`** — sticky bar; "Menu" toggles `fixed inset-0 z-50` overlay with staggered nav links.
8. **`components/ThemeSwitch.tsx`** — 3 buttons setting `document.documentElement.dataset.theme`, persisted to `localStorage`.
9. **`app/page.tsx`** — compose: Header → Wordmark hero → "Why" intro → product grid (`grid-cols-2 lg:grid-cols-4`) mapped over a `products` array → Footer.
10. **`lib/products.ts`** — ~12 placeholder products (name, price, two image urls, category).

## Verification
Run `next dev`, confirm: smooth scroll feel, cursor follows + morphs on links, wordmark intro plays on
load, cards reveal on scroll, hover wipe works, all three themes swap correctly, menu opens. Check mobile
(touch: Lenis syncTouch off → native), and `prefers-reduced-motion` fallback.

All decisions resolved (see "Build decisions" above).
