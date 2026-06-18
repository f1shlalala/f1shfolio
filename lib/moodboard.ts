// Single source of truth for the moodboard. Swap in your real content by editing
// this file and dropping images into public/moodboard/<section-id>/.

export type TileSize = "sm" | "md" | "lg" | "feature";
export type TileRatio = "portrait" | "square" | "landscape" | "wide" | "photo";

export type Tile = {
  src: string;
  alt: string;
  caption: string; // fades in on hover
  size: TileSize; // controls column span
  ratio: TileRatio; // controls height (aspect)
  col?: number; // optional 1-based desktop start column, used to sculpt whitespace
  hoverSrc?: string; // optional secondary image that crossfades in on hover (e.g. an ASCII render)
  hoverAlt?: string;
};

export type Section = {
  id: string; // anchor target, e.g. "fits"
  index: string; // "01"
  label: string;
  blurb?: string;
  tiles: Tile[];
};

export const profile = {
  name: "TAUSIF HASAN ",
  // The giant wordmark hero. Swap for your (first) name — one word reads best.
  displayName: "F1sh",
  role: "Student · Casually creative sometimes",
  location: "Dhk, Bangladesh",
  bio: "I'm Tausif. I dress okay, carry too much, own things I don't need and point camera at everything iloveLIGHTROOMandDA'VINCIRESOLVE.",
  socials: [
    { label: "Instagram", href: "#" },
    { label: "FaceBook", href: "#" },
    { label: "Pin", href: "#" },
    { label: "Email", href: "#" },
  ],
};

// Helper: build the src path for a section tile by 1-based index.
const src = (sectionId: string, n: number) =>
  `/moodboard/${sectionId}/${String(n).padStart(2, "0")}.svg`;

export const sections: Section[] = [
  {
    id: "fits",
    index: "01",
    label: "Fits",
    blurb: "What I reach for.",
    tiles: [
      { src: "/moodboard/fits/fit-02.webp", alt: "Dragon-print trousers, night", caption: "Dragon-print trousers", hoverSrc: "/moodboard/fits/fit-02-ascii.webp", hoverAlt: "ASCII rendering of the photo", size: "feature", ratio: "portrait", col: 1 },
      { src: "/moodboard/fits/fit-01.webp", alt: "Washed Cultx tee", caption: "Washed Cultx tee", hoverSrc: "/moodboard/fits/fit-01-ascii.webp", hoverAlt: "ASCII rendering of the photo", size: "sm", ratio: "portrait", col: 10 },
      { src: "/moodboard/fits/fit-03.webp", alt: "Draped shawl on the beach", caption: "Draped shawl, beach", hoverSrc: "/moodboard/fits/fit-03-ascii.webp", hoverAlt: "ASCII rendering of the photo", size: "md", ratio: "portrait", col: 2 },
      { src: "/moodboard/fits/fit-04.webp", alt: "Black hoodie fit", caption: "Black hoodie fit", hoverSrc: "/moodboard/fits/fit-04-ascii.webp", hoverAlt: "ASCII rendering of the photo", size: "sm", ratio: "portrait", col: 7 },
      { src: "/moodboard/fits/fit-05.webp", alt: "Overlooking the hills", caption: "On the overlook", hoverSrc: "/moodboard/fits/fit-05-ascii.webp", hoverAlt: "ASCII rendering of the photo", size: "lg", ratio: "photo", col: 1 },
      { src: "/moodboard/fits/fit-06.webp", alt: "Draped shawl on the river", caption: "Draped shawl, river", hoverSrc: "/moodboard/fits/fit-06-ascii.webp", hoverAlt: "ASCII rendering of the photo", size: "md", ratio: "portrait", col: 8 },
    ],
  },
  {
    id: "edc",
    index: "02",
    label: "EDC",
    blurb: "Everyday carry.",
    tiles: [
      { src: src("edc", 1), alt: "Field watch", caption: "Field watch", size: "feature", ratio: "portrait", col: 1 },
      { src: src("edc", 2), alt: "Leather wallet", caption: "Leather wallet", size: "sm", ratio: "square", col: 10 },
      { src: src("edc", 3), alt: "Keys and fob", caption: "Keys & fob", size: "md", ratio: "portrait", col: 2 },
      { src: src("edc", 4), alt: "Pocket knife", caption: "Pocket knife", size: "sm", ratio: "square", col: 7 },
      { src: src("edc", 5), alt: "Aviators", caption: "Aviators", size: "lg", ratio: "landscape", col: 1 },
    ],
  },
  {
    id: "cool-things-i-own",
    index: "03",
    label: "Cool Things I Own",
    blurb: "Things I keep close.",
    tiles: [
      { src: src("cool-things-i-own", 1), alt: "Brass desk lamp", caption: "Brass desk lamp", size: "feature", ratio: "landscape", col: 1 },
      { src: src("cool-things-i-own", 2), alt: "Field notes", caption: "Field notes", size: "md", ratio: "portrait", col: 9 },
      { src: src("cool-things-i-own", 3), alt: "Mechanical keyboard", caption: "Mechanical keyboard", size: "sm", ratio: "square", col: 2 },
      { src: src("cool-things-i-own", 4), alt: "Ceramic mug", caption: "Ceramic mug, chipped", size: "sm", ratio: "square", col: 6 },
      { src: src("cool-things-i-own", 5), alt: "Polaroid camera", caption: "Polaroid camera", size: "md", ratio: "portrait", col: 9 },
    ],
  },
  {
    id: "stills",
    index: "04",
    label: "Stills",
    blurb: "Frames I couldn't not take.",
    tiles: [
      { src: src("stills", 1), alt: "Lisbon at 6am", caption: "Lisbon, 6am", size: "lg", ratio: "landscape", col: 1 },
      { src: src("stills", 2), alt: "Tram 28", caption: "Tram 28", size: "sm", ratio: "portrait", col: 9 },
      { src: src("stills", 3), alt: "Noon shadow", caption: "Harsh noon shadow", size: "feature", ratio: "wide", col: 1 },
      { src: src("stills", 4), alt: "Rooftop in July", caption: "Rooftop, July", size: "md", ratio: "landscape", col: 8 },
      { src: src("stills", 5), alt: "Subway blur", caption: "Subway blur", size: "sm", ratio: "square", col: 2 },
      { src: src("stills", 6), alt: "Low tide", caption: "Low tide", size: "md", ratio: "portrait", col: 7 },
    ],
  },
];
