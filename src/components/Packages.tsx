import { PACKAGES, type PackageItem } from "@/data/site";
import PackageCard from "./PackageCard";
import { Reveal, SectionHeader } from "./Section";
const categories: PackageItem["category"][] = [
  "Private Tours",
  "Safari & Adventure",
  "Airport & Chauffeur",
];

export default function Packages() {
  return (
    <section className="bg-background pb-24 pt-36 lg:pb-32 lg:pt-44">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="The RA2 collection"
          title="South Africa, experienced your way."
          sub="Private day tours, bucket-list adventures and seamless transfers. Tell us what catches your eye and we'll create your personalised quote."
        />
        <div className="mt-14 space-y-16">
          {categories.map((category) => (
            <div key={category}>
              <Reveal>
                <div className="mb-7 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
                  <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                    {category}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    Thoughtfully planned. Entirely personal.
                  </span>
                </div>
              </Reveal>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PACKAGES.filter((i) => i.category === category).map(
                  (item, i) => (
                    <Reveal key={item.slug} delay={i * 0.04}>
                      <PackageCard item={item} />
                    </Reveal>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
