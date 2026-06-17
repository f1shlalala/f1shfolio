// Generates editorial-style SVG placeholders for the moodboard, one folder per
// section, with varied aspect ratios. Run: node scripts/gen-placeholders.mjs
// Swap these out by replacing the files in public/moodboard/<section>/.
import { mkdir, writeFile, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "moodboard");

// Mirrors lib/moodboard.ts (order = file number). Only ratio + caption are
// needed here for sizing and stamping.
const sections = [
  {
    id: "fits",
    label: "Fits",
    tiles: [
      { ratio: "portrait", caption: "Worn-in denim" },
      { ratio: "square", caption: "Grey marl tee" },
      { ratio: "portrait", caption: "Charcoal overcoat" },
      { ratio: "square", caption: "Field jacket" },
      { ratio: "landscape", caption: "Leather derbies" },
      { ratio: "portrait", caption: "Knit, undyed" },
    ],
  },
  {
    id: "edc",
    label: "EDC",
    tiles: [
      { ratio: "portrait", caption: "Field watch" },
      { ratio: "square", caption: "Leather wallet" },
      { ratio: "portrait", caption: "Keys & fob" },
      { ratio: "square", caption: "Pocket knife" },
      { ratio: "landscape", caption: "Aviators" },
    ],
  },
  {
    id: "cool-things-i-own",
    label: "Owned",
    tiles: [
      { ratio: "landscape", caption: "Brass desk lamp" },
      { ratio: "portrait", caption: "Field notes" },
      { ratio: "square", caption: "Mech keyboard" },
      { ratio: "square", caption: "Ceramic mug" },
      { ratio: "portrait", caption: "Polaroid camera" },
    ],
  },
  {
    id: "stills",
    label: "Stills",
    tiles: [
      { ratio: "landscape", caption: "Lisbon, 6am" },
      { ratio: "portrait", caption: "Tram 28" },
      { ratio: "wide", caption: "Noon shadow" },
      { ratio: "landscape", caption: "Rooftop, July" },
      { ratio: "square", caption: "Subway blur" },
      { ratio: "portrait", caption: "Low tide" },
    ],
  },
];

const dims = {
  portrait: [900, 1200],
  square: [1000, 1000],
  landscape: [1200, 900],
  wide: [1280, 720],
};

// Brand palettes cycled by global index: [bg, fg, accent].
const palettes = [
  ["#ede4dd", "#000000", "#ff0001"], // cream
  ["#000000", "#ede4dd", "#ff0001"], // black
  ["#ff0001", "#ede4dd", "#000000"], // red
];

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svg({ w, h, bg, fg, accent, label, n, caption }) {
  const pad = Math.round(w * 0.06);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="'Space Grotesk', Arial, sans-serif">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <g stroke="${fg}" stroke-width="1.5" opacity="0.15">
    <line x1="${pad}" y1="${pad * 2}" x2="${w - pad}" y2="${pad * 2}"/>
    <line x1="${pad}" y1="${h - pad * 2}" x2="${w - pad}" y2="${h - pad * 2}"/>
  </g>
  <text x="${pad}" y="${pad * 1.7}" fill="${fg}" font-size="${Math.round(w * 0.07)}" font-weight="700" letter-spacing="-2">${esc(label)}</text>
  <text x="${w - pad}" y="${pad * 1.7}" fill="${accent}" font-size="${Math.round(w * 0.05)}" font-weight="700" text-anchor="end">${n}</text>
  <text x="${w / 2}" y="${h / 2 + w * 0.04}" fill="${accent}" font-size="${Math.round(w * 0.22)}" font-weight="700" text-anchor="middle" letter-spacing="-6">${n}</text>
  <text x="${pad}" y="${h - pad}" fill="${fg}" font-size="${Math.round(w * 0.045)}" font-weight="500">${esc(caption)}</text>
</svg>`;
}

await mkdir(OUT, { recursive: true });

let count = 0;
let globalIdx = 0;
for (const section of sections) {
  const dir = join(OUT, section.id);
  await mkdir(dir, { recursive: true });
  // Remove only our own .svg placeholders so real photos (jpg/png/webp) survive.
  const existing = await readdir(dir).catch(() => []);
  for (const f of existing) {
    if (f.toLowerCase().endsWith(".svg")) {
      await rm(join(dir, f), { force: true });
    }
  }
  for (let i = 0; i < section.tiles.length; i++) {
    const tile = section.tiles[i];
    const [w, h] = dims[tile.ratio];
    const [bg, fg, accent] = palettes[globalIdx % palettes.length];
    const n = String(i + 1).padStart(2, "0");
    const out = svg({
      w, h, bg, fg, accent,
      label: section.label,
      n,
      caption: tile.caption,
    });
    await writeFile(join(dir, `${n}.svg`), out);
    count++;
    globalIdx++;
  }
}

console.log(`Generated ${count} moodboard placeholders in public/moodboard/`);
