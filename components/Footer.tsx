import type { Profile, Section } from "@/lib/moodboard";
import Magnetic from "./Magnetic";

// Bare emails typed in admin ("me@x.com") need mailto:, bare domains need https://.
const toHref = (h: string) =>
  /^[^\s@/:]+@[^\s@]+$/.test(h) ? `mailto:${h}`
  : /^([a-z]+:|#|\/)/i.test(h) ? h
  : `https://${h}`;

function Column({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs uppercase tracking-wide opacity-50">{title}</h4>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </div>
  );
}

export default function Footer({ profile, sections }: { profile: Profile; sections: Section[] }) {
  return (
    <footer
      id="contact"
      className="scroll-mt-20 border-t border-current/10 px-4 py-12 lg:px-6 lg:py-16"
    >
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        <Column title="Index">
          {sections.map((s) => (
            <li key={s.id}>
              <Magnetic>
                <a
                  href={`#${s.id}`}
                  data-cursor
                  className="link-hover text-sm uppercase tracking-tight"
                >
                  {s.label}
                </a>
              </Magnetic>
            </li>
          ))}
        </Column>

        <Column title="Elsewhere">
          {profile.socials.filter((s) => s.label && s.href).map((s, i) => (
            <li key={i}>
              <Magnetic>
                <a
                  href={toHref(s.href)}
                  {...(/^https?:/.test(s.href) && { target: "_blank", rel: "noreferrer" })}
                  data-cursor
                  className="link-hover text-sm uppercase tracking-tight"
                >
                  {s.label}
                </a>
              </Magnetic>
            </li>
          ))}
        </Column>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-wide opacity-50">Based in</h4>
          <p className="text-sm uppercase tracking-tight">{profile.location}</p>
        </div>

        <div className="flex flex-col justify-between gap-8">
          <p className="text-sm uppercase tracking-tight">{profile.role}</p>
          <p className="text-xs uppercase tracking-wide opacity-50">
            © 2026 {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
