import type { Section } from "@/lib/moodboard";
import Reveal from "./Reveal";
import MoodItem from "./MoodItem";

// A labeled moodboard section: index + title header, then a composed 12-column
// grid. Tiles carry explicit desktop start columns so the empty tracks read as
// intentional whitespace (no auto-flow backfill).
export default function MoodboardSection({ section }: { section: Section }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-20 px-4 py-16 lg:px-6 lg:py-28"
    >
      <Reveal className="group mb-8 flex items-baseline justify-between gap-4 lg:mb-12">
        <h2 className="flex items-baseline gap-3 text-sm uppercase tracking-tight lg:gap-4">
          <span className="inline-block overflow-y-clip align-bottom">
            <span className="inline-block translate-y-full text-red transition-transform delay-150 duration-700 ease-[var(--ease-out-extreme)] group-data-[inview=true]:translate-y-0">
              {section.index}
            </span>
          </span>
          <span>{section.label}</span>
        </h2>
        {section.blurb && (
          <p className="max-w-xs text-right text-xs uppercase tracking-tight opacity-60 lg:text-sm">
            {section.blurb}
          </p>
        )}
      </Reveal>

      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        {section.tiles.map((tile, i) => (
          <MoodItem key={tile.src} tile={tile} delay={(i % 3) * 90} />
        ))}
      </div>
    </section>
  );
}
