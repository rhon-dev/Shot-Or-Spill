/**
 * About, Drink Responsibly, and Terms (PRD §12, mock 18). Lazy-loaded so they
 * stay out of the first-load bundle. Terms is draft copy from the PRD; final
 * legal wording is a Phase 5 task.
 */
import type { ReactNode } from "react";
import { ScreenLayout } from "../components/ui";

export type InfoPageId = "about" | "drink-responsibly" | "terms";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-label text-accent">{title}</h2>
      <div className="mt-2 space-y-3 text-base font-medium leading-relaxed text-ink">{children}</div>
    </section>
  );
}

function Footer() {
  return (
    <>
      <div className="mt-8 h-px bg-line" />
      <p className="mt-4 text-[13px] font-medium text-muted">
        Shot or Spill is for adults 18+. It's for entertainment only and doesn't sell alcohol. Players are responsible for
        themselves.
      </p>
      <nav aria-label="More pages" className="mt-2 flex gap-1 text-sm font-semibold">
        <a href="#about" className="inline-flex min-h-12 items-center px-1 text-accent">About</a>
        <a href="#drink-responsibly" className="inline-flex min-h-12 items-center px-1 text-accent">Drink Responsibly</a>
        <a href="#terms" className="inline-flex min-h-12 items-center px-1 text-accent">Terms</a>
      </nav>
    </>
  );
}

function DrinkResponsibly() {
  return (
    <>
      <Section title="The pledge">
        <p>No one drives tonight. Skipping is always okay. Drink water.</p>
      </Section>
      <Section title="What's a shot">
        <p>A small tagay-sized pour, not a full glass.</p>
      </Section>
      <Section title="Pace yourself">
        <p>
          A Water Break comes up every 12 to 15 cards. When someone reaches 6 shots, the app suggests a water round. You can
          change that number on the scoreboard.
        </p>
        <p>Every card can be skipped, no questions asked.</p>
      </Section>
      <Section title="Get home safe">
        <p>Book a ride, stay over at the host's place, or take turns being the sober one. Nobody drives after drinking.</p>
      </Section>
    </>
  );
}

function About() {
  return (
    <>
      <Section title="The game">
        <p>
          Shot or Spill is a card game for one phone passed around the table at an inuman. Each card asks a personal, funny,
          or awkward question. Answer honestly, or take a shot and keep your secret.
        </p>
      </Section>
      <Section title="Made for the barkada">
        <p>
          Every card is written in English around Filipino life: titas, exes, situationships, videoke, family group chats, and
          office drama.
        </p>
      </Section>
      <Section title="Privacy">
        <p>
          No account, no ads. Player names and scores stay on this phone and are never sent anywhere. Clearing your browser
          data removes them.
        </p>
      </Section>
    </>
  );
}

function Terms() {
  return (
    <>
      <Section title="Entertainment only">
        <p>Shot or Spill is a party game for adults 18 and over. It's for entertainment only.</p>
      </Section>
      <Section title="No alcohol sales">
        <p>This site doesn't sell, promote, or deliver alcohol, and it isn't affiliated with any alcohol brand.</p>
      </Section>
      <Section title="Your responsibility">
        <p>
          Players are responsible for themselves: how much they drink, how they get home, and following local laws. Skip any
          card, any time.
        </p>
      </Section>
      <p className="mt-6 text-[13px] font-medium text-muted">Draft terms. Final wording comes before launch.</p>
    </>
  );
}

const PAGES: Record<InfoPageId, { title: string; body: () => ReactNode }> = {
  about: { title: "ABOUT", body: About },
  "drink-responsibly": { title: "DRINK RESPONSIBLY", body: DrinkResponsibly },
  terms: { title: "TERMS", body: Terms },
};

export default function InfoPage({ page, onClose }: { page: InfoPageId; onClose: () => void }) {
  const { title, body: Body } = PAGES[page];
  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-bg">
      <ScreenLayout title={title} onBack={onClose}>
        <Body />
        <Footer />
      </ScreenLayout>
    </div>
  );
}
