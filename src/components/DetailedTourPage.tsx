import { CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { DETAILED_TOURS } from "@/data/site";
import peninsulaImg from "@/assets/tour-peninsula.jpg";
import wineImg from "@/assets/tour-wine.jpg";
import cityImg from "@/assets/tour-table.jpg";
import bokaapImg from "@/assets/Bokaap.webp";
import wineFarmImg from "@/assets/winefarm.webp";
import wine2Img from "@/assets/wine2.webp";
import penguinImg from "@/assets/Pengi.webp";
import capeImg from "@/assets/Capeofgoodhope.jpg";
import { Reveal } from "./Section";

type TourKey = "peninsula" | "city" | "winelands";

const HERO: Record<TourKey, string> = {
  peninsula: peninsulaImg,
  city: cityImg,
  winelands: wineImg,
};

const GALLERY: Record<TourKey, [string, string, string, string]> = {
  peninsula: [capeImg, penguinImg, capeImg, penguinImg],
  city: [cityImg, bokaapImg, cityImg, bokaapImg],
  winelands: [wineImg, wineFarmImg, wine2Img, wineImg],
};

export default function DetailedTourPage({ tourKey }: { tourKey: TourKey }) {
  const tour = DETAILED_TOURS[tourKey];
  const addOns = tour.addOns ?? [];
  const notIncluded = tour.notIncluded ?? [];
  const idealFor = tour.idealFor ?? [];
  const [imgA, imgB] = GALLERY[tourKey];

  return (
    <main id="main-content" className="bg-background text-foreground">
      <section className="relative min-h-[78svh] overflow-hidden pt-28">
        <img
          src={HERO[tourKey]}
          alt={tour.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-black/25" />
        <div className="relative z-10 mx-auto flex min-h-[70svh] max-w-7xl flex-col justify-end px-5 pb-16 lg:px-8">
          <Reveal>
            <div className="max-w-4xl">
              <span className="inline-flex rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground">
                {tour.label}
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
                {tour.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85">
                {tour.intro}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={`/?service=${tour.slug}#book`}
                  className="rounded-full bg-accent px-7 py-4 font-semibold text-accent-foreground shadow-glow transition hover:opacity-90"
                >
                  Book this tour
                </a>
                {
                  <span className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur">
                    Request a Quote
                  </span>
                }
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Experience
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
                {tour.title}
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted-foreground">
                {tour.description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <img
                  src={imgA}
                  alt=""
                  className="h-44 w-full rounded-2xl object-cover"
                />
                <img
                  src={imgB}
                  alt=""
                  className="h-44 w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 sm:auto-rows-fr">
            {tour.highlights.map((highlight, index) => (
              <Reveal key={highlight.title} delay={index * 0.03}>
                <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <MapPin className="h-5 w-5 text-accent" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {highlight.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-3 lg:px-8">
          <InfoList title="What's included" items={tour.included} />
          {addOns.length > 0 && (
            <InfoList title="Optional add-ons" items={addOns} icon="spark" />
          )}
          {notIncluded.length > 0 && (
            <InfoList title="Not included" items={notIncluded} />
          )}
        </div>
      </section>

      {idealFor.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Why RA2 Travel & Tours
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Professional, reliable and memorable Cape Town travel
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {tour.closing}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {idealFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <a
                href="#book"
                className="mt-10 inline-flex rounded-full bg-accent px-7 py-4 font-semibold text-accent-foreground shadow-glow transition hover:opacity-90"
              >
                Book this experience
              </a>
            </Reveal>
          </div>
        </section>
      )}
    </main>
  );
}

function InfoList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon?: "spark";
}) {
  const Icon = icon === "spark" ? Sparkles : CheckCircle2;

  return (
    <Reveal>
      <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-display text-xl font-bold text-foreground">
          {title}
        </h3>
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
