import { Link } from "@tanstack/react-router";
import { Wine, MapPin } from "lucide-react";
import { DETAILED_TOURS } from "@/data/site";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import heroImg from "@/assets/Descrip2 (1).png";
import slideImg1 from "@/assets/Descrip2 (2).png";
import slideImg2 from "@/assets/Descrip2 (3).png";
import slideImg3 from "@/assets/Descrip2 (4).png";
import slideImg4 from "@/assets/Descrip2 (5).png";
import { Reveal, SectionHeader } from "./Section";

const slides = [heroImg, slideImg1, slideImg2, slideImg3, slideImg4];

export default function StellenboschWineTourSection() {
  const tour = DETAILED_TOURS.winelands;

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Featured tour"
          title="Stellenbosch Wine Tour"
          sub="Sip, savour and explore the Cape Winelands on a private chauffeur-driven wine experience."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <Reveal>
            <div className="rounded-[32px] border border-border bg-card p-8 shadow-elegant">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground">
                <Wine className="h-4 w-4" />
                Wine country chauffeur tour
              </div>

              <h2 className="mt-6 font-display text-4xl font-bold text-foreground sm:text-5xl">
                {tour.title}
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {tour.intro}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {tour.highlights.slice(0, 4).map((highlight) => (
                  <div
                    key={highlight.title}
                    className="rounded-[28px] border border-border bg-background/70 p-5 transition hover:border-accent/30 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 text-accent">
                      <MapPin className="h-4 w-4" />
                      <p className="font-semibold text-foreground">
                        {highlight.title}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {highlight.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/stellenbosch-wine-tour"
                    className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-foreground shadow-glow transition hover:opacity-90"
                  >
                    View tour details
                  </Link>
                  <a
                    href="/?service=cape-winelands#book"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
                  >
                    Book now
                  </a>
                </div>
                <div className="rounded-[28px] border border-border bg-secondary/20 px-5 py-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Request a Quote
                  </span>
                  {tour.priceNote ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {tour.priceNote}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-border bg-slate-950/5 shadow-sm">
              <Carousel
                opts={{ loop: true, dragFree: true }}
                className="relative"
              >
                <CarouselContent className="flex">
                  {slides.map((src, index) => (
                    <CarouselItem key={index} className="min-w-full">
                      <img
                        src={src}
                        alt={`Stellenbosch wine tour slide ${index + 1}`}
                        className="h-[520px] w-full object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-foreground/70 shadow-glow" />
                <CarouselNext className="text-foreground/70 shadow-glow" />
              </Carousel>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
