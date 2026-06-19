import Header from "@/components/Header";
import Wordmark from "@/components/Wordmark";
import Reveal from "@/components/Reveal";
import MoodboardSection from "@/components/MoodboardSection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import IntroGate from "@/components/IntroGate";
import { profile, sections } from "@/lib/moodboard";

export default function Home() {
  return (
    <>
      <IntroGate />
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        {/* About / Intro hero */}
        <section id="about" className="scroll-mt-20 px-4 pb-8 pt-20 lg:px-6 lg:pt-28">
          <Wordmark text={profile.displayName} />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <p className="text-2xl leading-[1.15] tracking-tight break-words lg:text-4xl">
                {profile.bio}
              </p>
            </Reveal>
            <Reveal
              delay={120}
              className="flex flex-col gap-1 text-sm uppercase tracking-tight lg:col-span-4 lg:col-start-9"
            >
              <span className="opacity-50">{profile.name}</span>
              <span>{profile.role}</span>
              <span className="text-red">{profile.location}</span>
            </Reveal>
          </div>
        </section>

        {/* Moodboard sections */}
        {sections.map((section) => (
          <MoodboardSection key={section.id} section={section} />
        ))}
      </main>
      <Footer />
    </>
  );
}
