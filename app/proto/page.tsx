"use client";

import { useState } from "react";
import PrototypeDissolve from "@/components/PrototypeDissolve";

const ASCII = "/moodboard/fits/fit-02-ascii.webp";
const PHOTO = "/moodboard/fits/fit-02.webp";

const VARIANTS = [
  { id: 1, name: "Ripple", desc: "Refractive wavefront blooms from the cursor" },
  { id: 2, name: "Glass lens", desc: "Liquid droplet refracts the photo, tracks cursor" },
  { id: 3, name: "Flowing wipe", desc: "Seam follows cursor, edge undulates on a flow" },
  { id: 4, name: "Pixel-resolve", desc: "Chunky ASCII blocks sharpen into the photo" },
  { id: 5, name: "Focus pull", desc: "Defocused ASCII resolves sharp around the cursor" },
  { id: 6, name: "Liquid melt", desc: "ASCII drips away as the photo flows down" },
];

export default function ProtoPage() {
  const [v, setV] = useState(1);

  return (
    <main
      data-lenis-prevent
      className="h-screen overflow-y-auto bg-cream px-6 py-10 text-black lg:px-10"
    >
      <h1 className="text-2xl font-bold uppercase tracking-tight lg:text-4xl">
        Transition styles — round 2
      </h1>
      <p className="mt-3 max-w-xl text-sm uppercase tracking-tight opacity-60">
        Liquid / ASCII-resolve, refined. Hover the preview and move your cursor
        around. Switch effects with the buttons. Tell me which number(s) land.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="relative aspect-[3/4] w-full max-w-[440px] overflow-hidden bg-black/10">
          <PrototypeDissolve
            src={ASCII}
            hoverSrc={PHOTO}
            variant={v}
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className="flex flex-col gap-3 lg:w-80">
          {VARIANTS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setV(x.id)}
              className={`border px-4 py-3 text-left transition-colors ${
                v === x.id ? "border-red text-red" : "border-black/15 hover:border-black/40"
              }`}
            >
              <div className="text-sm uppercase tracking-tight">
                {x.id}. {x.name}
              </div>
              <div className="mt-0.5 text-xs uppercase tracking-tight opacity-50">
                {x.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
