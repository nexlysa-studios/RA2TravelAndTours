import bmw2 from "@/images/bmw2.jpeg";
import { Reveal } from "./Section";

export default function About() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <div className="relative">
            <img
              src={bmw2}
              alt="Private vehicle in Cape Town"
              loading="lazy"
              className="rounded-3xl shadow-elegant w-full aspect-[4/5] object-cover"
            />
            <div className="hidden md:block absolute -bottom-6 -right-6 bg-gradient-sunset text-white p-6 rounded-2xl shadow-glow max-w-[220px]">
              <div className="font-display font-bold text-2xl">Your Cape.</div>
              <div className="text-sm opacity-90">Your pace. Your people.</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Meet RA2
          </span>
          <h2 className="mt-3 font-display font-bold text-3xl lg:text-5xl text-foreground text-balance">
            Local hearts. Extraordinary journeys.
          </h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
            RA2 Travel & Tours is a Cape Town-based tour operator specialising
            in private tours, guided day trips, tailor-made travel experiences,
            airport transfers and unforgettable adventures across South Africa.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We believe the best journeys feel personal. For individuals,
            couples, families and groups, we bring together flexible
            itineraries, professional local guides and comfortable transport, so
            you can spend more time enjoying the places you came to discover.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-5">
            {[
              ["Local knowledge", "People who know the destination."],
              ["Personal service", "A welcoming team, every step."],
              ["Made around you", "Your interests, your pace, your itinerary."],
              ["Passion for tourism", "Sharing the places we love."],
            ].map(([t, d]) => (
              <div key={t}>
                <div className="font-display font-semibold text-foreground">
                  {t}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{d}</div>
              </div>
            ))}
          </div>

          <a
            href="#book"
            className="mt-8 inline-block px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-elegant"
          >
            Let's make memories
          </a>
        </Reveal>
      </div>
    </section>
  );
}
