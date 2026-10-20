import { useState } from "react";
import { Bus, Car, Plane, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import chauffeurImg from "@/images/sedan4.jpeg";
import shuttleImg from "@/assets/WhatsApp Image 2026-05-27 at 13.53.41.jpeg";
import airportImg from "@/images/bmw3.jpeg";
import { Reveal } from "./Section";
import { whatsappLink } from "@/data/site";

const options = [
  {
    title: "Chauffeur Services",
    icon: ShieldCheck,
    image: chauffeurImg,
    heading: "Private chauffeur service in Cape Town",
    body: "Travel in comfort with a professional driver for business trips, special occasions, wine farms and custom city routes.",
    cta: "Explore fleet",
    href: "/fleet",
  },
  {
    title: "Family & Group Travel",
    icon: Bus,
    image: shuttleImg,
    heading: "Your people. One memorable journey.",
    body: "Comfortable vans, minivans and larger group transport or coaches by arrangement. Share your group size and luggage needs and we'll find the right fit.",
    cta: "Explore experiences",
    href: "/packages",
  },
  {
    title: "Private Airport Transfers",
    icon: Plane,
    image: airportImg,
    heading: "Cape Town airport transfers made easy",
    body: "Private transfers, airport meet and greet, a personalised tour-guide welcome and executive/VIP arrivals. Travel with a professional driver in a comfortable vehicle suited to your group.",
    cta: "Book transfer",
    href: "/?service=airport-transfer#book",
  },
];

export default function ServiceOptions() {
  const [activeIndex, setActiveIndex] = useState(2);
  const activeOption = options[activeIndex];

  return (
    <section id="transfers" className="bg-background pb-20">
      <div className="bg-gradient-ocean px-5 pb-24 pt-16 text-center lg:px-8">
        <Reveal>
          <h2 className="mx-auto max-w-4xl font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Arrive relaxed. Leave with memories.
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto -mt-14 max-w-7xl px-5 lg:px-8">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
          {options.map((option, index) => {
            const Icon = option.icon;
            const isActive = index === activeIndex;

            return (
              <button
                key={option.title}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveIndex(index)}
                className={`rounded-md border p-5 text-center shadow-elegant transition ${
                  isActive
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground hover:-translate-y-1 hover:border-accent/40"
                }`}
              >
                <Icon className="mx-auto h-7 w-7" />
                <span className="mt-3 block font-display text-base font-semibold">
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>

        <Reveal>
          <div className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-md border border-border bg-card shadow-elegant lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative min-h-[280px] overflow-hidden sm:min-h-[420px]">
              <img
                src={activeOption.image}
                alt={activeOption.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </div>
            <div className="flex flex-col justify-center p-7 text-center sm:p-10 lg:text-left">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent lg:mx-0">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {activeOption.heading}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {activeOption.body}
              </p>
              {activeIndex === 2 && (
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Please book at least 24 hours before arrival where possible.
                  Available 24/7 via WhatsApp for enquiries and short-notice
                  requests.
                </p>
              )}
              <a
                href={activeOption.href}
                className="mx-auto mt-7 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-accent hover:text-accent-foreground lg:mx-0"
              >
                {activeOption.cta}
              </a>
              <a
                href={whatsappLink(
                  "Hi RA2 Travel & Tours, I'd like to arrange private transport.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm font-semibold text-accent"
              >
                Chat to RA2 on WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
