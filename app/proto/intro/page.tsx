"use client";

import { useState, useCallback } from "react";
import Preloader from "@/components/Preloader";
import Wordmark from "@/components/Wordmark";

// Isolated prototype of the intro preloader → landing handoff.
// Does NOT affect the real site; preview at /proto/intro.
export default function IntroProto() {
  const [run, setRun] = useState(0); // replay key
  const [showHero, setShowHero] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  const onHandoff = useCallback(() => setShowHero(true), []);
  const onComplete = useCallback(() => setShowPreloader(false), []);

  const replay = () => {
    setShowHero(false);
    setShowPreloader(false);
    // remount on next tick with a fresh key
    requestAnimationFrame(() => {
      setRun((n) => n + 1);
      setShowPreloader(true);
    });
  };

  return (
    <main className="relative min-h-screen bg-cream text-black">
      {/* Mock landing behind the overlay — the hero mounts (and plays its
          slide-up) only when the preloader hands off. */}
      <section className="flex min-h-screen flex-col justify-center px-4 lg:px-6">
        {showHero && <Wordmark text="F1sh" />}
        {showHero && (
          <p className="mt-8 max-w-xl text-lg opacity-60">
            (mock landing — the real hero + moodboard would be here)
          </p>
        )}
      </section>

      {showPreloader && (
        <Preloader key={run} onHandoff={onHandoff} onComplete={onComplete} />
      )}

      {/* Prototype controls */}
      <button
        onClick={replay}
        className="fixed bottom-4 right-4 z-[200] rounded-full border border-black/20 bg-cream px-4 py-2 text-xs uppercase tracking-tight hover:bg-black hover:text-cream"
      >
        Replay intro
      </button>
    </main>
  );
}
