import { profile as staticProfile, sections as staticSections, type Profile, type Section } from "./moodboard";

const HUB = process.env.NEXT_PUBLIC_HUB_URL || "https://tausifhasan.com";

// Fetch live moodboard content from the hub. ISR-cache it, and fall back to the
// bundled static content if the hub is unreachable so the page never white-screens.
export async function getMoodboard() {
  try {
    const r = await fetch(`${HUB}/api/moodboard`, { next: { revalidate: 300, tags: ["moodboard"] } });
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    if (!data?.sections?.length) throw new Error("empty");
    return data as { profile: Profile; sections: Section[] };
  } catch {
    return { profile: staticProfile, sections: staticSections };
  }
}
