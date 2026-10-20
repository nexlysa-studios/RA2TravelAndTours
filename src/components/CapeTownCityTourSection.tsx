import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!emblaApi) return;
    const interval = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Featured tours"
          title="Cape Town City, Winelands & Peninsula Tours"
          sub="Discover three sides of the Cape, each with its own stories, scenery and a private itinerary shaped around you."
        />

        <div className="mt-16 overflow-hidden">
          <Carousel
            opts={{ loop: true, align: "start", containScroll: "trimSnaps" }}
            setApi={setEmblaApi}
            className="relative"
          >
            <CarouselContent className="flex">
              {slides.map((slide) => (
                <CarouselItem key={slide.id} className="min-w-full pl-4">
                  <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
                    <Reveal>
                      <div className="flex h-full flex-col justify-between p-8">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground">
                            {slide.id === "peninsula" ? (
                              <Wine className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            {slide.label}
                          </div>
                          <h2 className="mt-6 font-display text-4xl font-bold text-foreground sm:text-5xl">
                            {slide.title}
                          </h2>
                          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                            {slide.intro}
                          </p>

                          <div className="mt-10 grid gap-4 sm:grid-cols-2">
                            {slide.tour.highlights
                              .slice(0, 4)
                              .map((highlight) => (
                                <div
                                  key={highlight.title}
                                  className="rounded-[28px] border border-border bg-background/70 p-5 transition hover:border-accent/40 hover:shadow-sm"
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
                        </div>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap gap-3">
                            <Link
                              to={slide.detailPath}
                              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-foreground shadow-glow transition hover:opacity-90"
                            >
                              View tour details
                            </Link>
                            <a
                              href={`/?service=${slide.tour.slug}#book`}
                              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
                            >
                              Book now
                            </a>
                          </div>
                          <div className="rounded-[28px] border border-border bg-secondary/20 px-5 py-4 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              Request a Quote
                            </span>
                            {slide.tour.priceNote ? (
                              <span className="text-muted-foreground">
                                {" "}
                                · {slide.tour.priceNote}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </Reveal>

                    <Reveal>
                      <div className="grid gap-4">
                        <div className="overflow-hidden rounded-[28px]">
                          <img
                            src={slide.hero}
                            alt={`${slide.title} hero image`}
                            className="h-[420px] w-full object-cover"
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {slide.images.slice(0, 2).map((img, idx) => (
                            <div
                              key={idx}
                              className="overflow-hidden rounded-[24px]"
                            >
                              <img
                                src={img}
                                alt={`${slide.title} image ${idx + 1}`}
                                className="h-44 w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-foreground/80 shadow-glow" />
            <CarouselNext className="text-foreground/80 shadow-glow" />
          </Carousel>

          <div className="mt-6 flex justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  selectedIndex === index
                    ? "bg-accent"
                    : "bg-muted-foreground/40"
                }`}
                aria-label={`Go to ${slide.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
