import { SectionHeader } from "./Section";

const excludedFleetFiles = new Set([
  "WhatsApp Image 2026-05-27 at 13.53.44 (1).jpeg",
  "WhatsApp Image 2026-05-27 at 13.53.44 (2).jpeg",
  "WhatsApp Image 2026-05-27 at 13.53.44 (3).jpeg",
  "WhatsApp Image 2026-05-27 at 13.53.44.jpeg",
  "WhatsApp Image 2026-05-27 at 13.53.45 (2).jpeg",
]);

const isLogoFile = (fileName: string) => /logo/i.test(fileName);
const getFileName = (path: string) => path.split("/").pop() ?? "";

const fleetImages: string[] = [
  ...Object.entries(
    import.meta.glob("../assets/WhatsApp Image*.{jpg,jpeg,png,webp}", {
      eager: true,
    }),
  ).filter(([path]) => !excludedFleetFiles.has(getFileName(path))),
  ...Object.entries(
    import.meta.glob(
      ["../images/*.{jpg,jpeg,png,webp}", "!../images/*[Ll]ogo*"],
      { eager: true },
    ),
  ).filter(([path]) => !isLogoFile(getFileName(path))),
]
  .map(([path, module]) => ({
    path,
    src: (module as { default: string }).default,
  }))
  .sort((a, b) => a.path.localeCompare(b.path))
  .reverse()
  .map((image) => image.src);

export default function Fleet() {
  return (
    <section id="fleet" className="py-24 lg:py-32 bg-background scroll-mt-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Fleet Gallery"
          title="Browse our Fleet Collection"
          sub="A clean, modern display of our vehicles on the road."
          textColor="text-foreground"
          subColor="text-foreground/70"
        />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {fleetImages.map((src, index) => (
            <div
              key={src}
              className="overflow-hidden rounded-[28px] border border-border bg-card shadow-elegant transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_25px_80px_-40px_rgba(15,23,42,0.75)]"
            >
              <img
                src={src}
                alt={`Fleet image ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-72 w-full object-cover transition duration-500 ease-out hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
