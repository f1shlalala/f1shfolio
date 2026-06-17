import type { Tile } from "@/lib/moodboard";
import Reveal from "./Reveal";
import DissolveImage from "./DissolveImage";

// Column span per size (mobile -> desktop). Literal strings so Tailwind's JIT
// scanner can see them.
const sizeClasses: Record<Tile["size"], string> = {
  feature: "col-span-12 lg:col-span-6",
  lg: "col-span-6 lg:col-span-5",
  md: "col-span-6 lg:col-span-4",
  sm: "col-span-6 lg:col-span-3",
};

const ratioClasses: Record<Tile["ratio"], string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  photo: "aspect-[3/2]",
};

// Desktop start column (sculpts intentional whitespace). Literal map for the JIT.
const colStartClasses: Record<number, string> = {
  1: "lg:col-start-1",
  2: "lg:col-start-2",
  3: "lg:col-start-3",
  4: "lg:col-start-4",
  5: "lg:col-start-5",
  6: "lg:col-start-6",
  7: "lg:col-start-7",
  8: "lg:col-start-8",
  9: "lg:col-start-9",
  10: "lg:col-start-10",
  11: "lg:col-start-11",
  12: "lg:col-start-12",
};

// A single moodboard tile: image with a caption that fades in on hover, plus the
// custom-cursor morph. Wrapped in Reveal so it animates in on scroll.
export default function MoodItem({
  tile,
  delay = 0,
}: {
  tile: Tile;
  delay?: number;
}) {
  const colStart = tile.col ? colStartClasses[tile.col] : "";

  return (
    <Reveal delay={delay} className={`${sizeClasses[tile.size]} ${colStart}`}>
      <figure
        data-cursor
        data-cursor-label="View"
        data-tile
        className={`group relative overflow-hidden bg-black/5 dark:bg-white/5 ${ratioClasses[tile.ratio]}`}
      >
        {tile.hoverSrc ? (
          // Cursor-driven dissolve. Reversed: the tile RESTS as the ASCII
          // (passed as the base) and dissolves to the real photo on hover.
          <DissolveImage
            src={tile.hoverSrc}
            hoverSrc={tile.src}
            alt={tile.hoverAlt ?? ""}
            hoverAlt={tile.alt}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={tile.src}
            alt={tile.alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-extreme)] group-hover:scale-105 group-[.is-touched]:scale-105"
          />
        )}
        {/* caption reveal */}
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs uppercase tracking-tight text-cream opacity-0 transition-all duration-300 ease-[var(--ease-out-extreme)] group-hover:translate-y-0 group-hover:opacity-100 group-[.is-touched]:translate-y-0 group-[.is-touched]:opacity-100">
          {tile.caption}
        </figcaption>
      </figure>
    </Reveal>
  );
}
