import { FEATURED_PACKAGES } from "@/data/site";
import PackageCard from "./PackageCard";
import { SectionHeader, Reveal } from "./Section";

export default function Tours() {
  return (
    <section id="tours" className="bg-secondary/50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Extraordinary places. Personal experiences."
          title="Find your kind of unforgettable"
          sub="From the wild coast to the Winelands, discover the experiences that make South Africa special. Every journey starts with you."
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PACKAGES.map((item, i) => (
            <Reveal key={item.slug} delay={(i % 3) * 0.06}>
              <PackageCard item={item} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="/packages"
            className="inline-flex rounded-full border border-primary/25 px-7 py-3.5 font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Explore all experiences
          </a>
        </div>
      </div>
    </section>
  );
}
