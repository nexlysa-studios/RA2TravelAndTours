import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock3, MapPin, Wine } from "lucide-react";
import { DETAILED_TOURS } from "@/data/site";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import cityHeroImg from "@/assets/Descrip1 (1).png";
import cityImg1 from "@/assets/Descrip1 (2).png";
import cityImg2 from "@/assets/Descrip1 (3).png";
import cityImg3 from "@/assets/Descrip1 (4).png";
import cityImg4 from "@/assets/Descrip1 (5).png";
import wineHeroImg from "@/assets/Descrip2 (1).png";
import wineImg1 from "@/assets/Descrip2 (5).png";
import wineImg2 from "@/assets/Descrip2 (3).png";
import wineImg3 from "@/assets/Descrip2 (4).png";
import wineImg4 from "@/assets/Descrip2 (2).png";
import peninsulaHeroImg from "@/assets/Descrip3 (1).png";
import peninsulaImg1 from "@/assets/Descrip3 (2).png";
import peninsulaImg2 from "@/assets/Descrip3 (3).png";
import peninsulaImg3 from "@/assets/Descrip3 (4).png";
import peninsulaImg4 from "@/assets/Descrip3 (5).png";
import { Reveal, SectionHeader } from "./Section";
import type { CarouselApi } from "@/components/ui/carousel";

const slides = [
  {
    id: "city",
    label: "City chauffeur tour",
    title: "Cape Town City Tour",
    intro:
      "Discover the heart and soul of the Mother City on a private chauffeur-guided city tour.",
    detailPath: "/cape-town-city-tour",
    hero: cityHeroImg,
    images: [cityImg1, cityImg2, cityImg3, cityImg4],
    tour: DETAILED_TOURS.city,
  },
  {
    id: "winelands",
    label: "Wine country chauffeur tour",
    title: "Stellenbosch Wine Tour",
    intro:
      "Sip world-class wines and enjoy scenic vineyards on a private Stellenbosch chauffeur tour.",
    detailPath: "/stellenbosch-wine-tour",
    hero: wineHeroImg,
    images: [wineImg1, wineImg2, wineImg3, wineImg4],
    tour: DETAILED_TOURS.winelands,
  },
  {
    id: "peninsula",
    label: "Peninsula chauffeur tour",
    title: "Cape Peninsula Tour",
    intro:
      "Experience the beauty, adventure, and charm of the Cape Peninsula on a spectacular full-day private tour.",
    detailPath: "/cape-peninsula-tour",
    hero: peninsulaHeroImg,
    images: [peninsulaImg1, peninsulaImg2, peninsulaImg3, peninsulaImg4],
    tour: DETAILED_TOURS.peninsula,
  },
];

export default function CapeTownCityTourSection() {
  const [emblaApi, setEmblaApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Featured tours"
          title="Cape Town City, Winelands & Peninsula Tours"
          sub="Discover three sides of the Cape, each with its own stories, scenery and a private itinerary shaped around you."
        />

        <div className="mt-10 sm:mt-14">
          <Carousel
            aria-label="Featured private tours"
            opts={{ loop: true, align: "start", containScroll: "trimSnaps" }}
            setApi={setEmblaApi}
            className="relative mx-auto max-w-6xl"
          >
            <CarouselContent className="flex">
              {slides.map((slide, index) => (
                <CarouselItem key={slide.id} className="pl-4">
                  <article
                    aria-label={`${slide.title} featured tour`}
                    aria-roledescription="slide"
                    className="grid overflow-hidden rounded-[28px] border border-border bg-card shadow-elegant lg:min-h-[600px] lg:grid-cols-[0.92fr_1.08fr] lg:rounded-[36px]"
                  >
                    <Reveal className="order-2 flex min-w-0 flex-col p-5 sm:p-8 lg:order-1 lg:p-10 xl:p-12">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-accent sm:text-xs">
                        {slide.id === "winelands" ? (
                          <Wine className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        {slide.label}
                      </div>
                      <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-foreground sm:mt-6 sm:text-4xl xl:text-5xl">
                        {slide.title}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
                        {slide.intro}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium sm:mt-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2 text-secondary-foreground">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          {slide.tour.label}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2 text-secondary-foreground">
                          <Clock3 className="h-3.5 w-3.5 text-accent" />
                          Private chauffeur tour
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3">
                        {slide.tour.highlights.slice(0, 4).map((highlight) => (
                          <div
                            key={highlight.title}
                            className="rounded-2xl border border-border/80 bg-background/70 p-3.5 sm:rounded-[20px] sm:p-4"
                          >
                            <div className="flex items-start gap-2 text-accent">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <p className="text-xs font-semibold leading-snug text-foreground sm:text-sm">
                                {highlight.title}
                              </p>
                            </div>
                            <p className="mt-2 hidden text-xs leading-relaxed text-muted-foreground sm:block">
                              {highlight.desc}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:mt-auto sm:flex-row sm:flex-wrap sm:items-center sm:pt-8">
                        <Link
                          to={slide.detailPath}
                          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-glow transition hover:-translate-y-0.5 hover:opacity-90"
                        >
                          Explore this tour
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                        <a
                          href={`/?service=${slide.tour.slug}#book`}
                          className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-secondary"
                        >
                          Request a quote
                        </a>
                      </div>
                      {slide.tour.priceNote && (
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                          {slide.tour.priceNote}
                        </p>
                      )}
                    </Reveal>

                    <Reveal className="order-1 min-w-0 bg-secondary/40 p-3 sm:p-5 lg:order-2 lg:p-6">
                      <div className="relative h-full min-h-[220px] sm:min-h-[320px] lg:min-h-[540px]">
                        <div className="absolute inset-0 overflow-hidden rounded-[22px] sm:rounded-[28px]">
                          <img
                            src={slide.hero}
                            alt={`${slide.title} scenic view`}
                            className="h-full min-h-[220px] w-full object-cover sm:min-h-[320px] lg:min-h-[540px]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-black/5" />
                          <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:bottom-5 sm:left-5">
                            {slide.label}
                          </span>
                        </div>
                        <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
                          <CarouselPrevious
                            aria-label="Previous featured tour"
                            className="static h-10 w-10 translate-y-0 border-white/60 bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:bg-white sm:h-11 sm:w-11"
                          />
                          <CarouselNext
                            aria-label="Next featured tour"
                            className="static h-10 w-10 translate-y-0 border-white/60 bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:bg-white sm:h-11 sm:w-11"
                          />
                        </div>
                        <div className="absolute bottom-3 right-3 grid w-[min(45%,13rem)] grid-cols-2 gap-2 sm:bottom-4 sm:right-4 sm:w-[min(46%,17rem)] sm:gap-3">
                          {slide.images.slice(0, 2).map((img, imageIndex) => (
                            <div
                              key={img}
                              className="overflow-hidden rounded-xl border-2 border-white/90 shadow-lg sm:rounded-2xl"
                            >
                              <img
                                src={img}
                                alt={`${slide.title} tour view ${imageIndex + 1}`}
                                loading="lazy"
                                className="aspect-[4/3] w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div
            className="mt-5 flex items-center justify-center gap-2.5 sm:mt-7"
            aria-label="Choose a featured tour"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                className={`rounded-full transition-all duration-300 ${
                  selectedIndex === index
                    ? "h-2.5 w-8 bg-accent"
                    : "h-2.5 w-2.5 bg-muted-foreground/35 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Go to ${slide.title}`}
                aria-current={selectedIndex === index ? "true" : undefined}
              />
            ))}
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              {slides[selectedIndex].title}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
