import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { SectionHeader } from "./Section";
import gebbaImg from "@/assets/corner.webp";
import boatImg from "@/assets/Boat.jpg";
import capeImg from "@/assets/goodhope.webp";
import pengiImg from "@/assets/Pengi.webp";
import sealImg from "@/assets/SEAL.webp";
import sunsetImg from "@/assets/sunset2.webp";
import wineImg from "@/assets/winefarm.webp";

type GalleryImage = {
  src: string;
  alt: string;
  span?: string;
};

const excludedGalleryFiles = [/^Sponsor/i, /^tour-/i, /^hero-capetown/i, /^WhatsApp Image/i];

const allImages: GalleryImage[] = Object.entries(
  import.meta.glob("../assets/*.{jpg,jpeg,png,webp}", { eager: true }),
)
  .filter(([path]) => {
    const fileName = path.split("/").pop() ?? "";
    return !excludedGalleryFiles.some((pattern) => pattern.test(fileName));
  })
  .map(([path, module]) => {
    const fileName =
      path
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") ?? "Image";

    return {
      src: (module as { default: string }).default,
      alt: fileName.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
    };
  })
  .sort((a, b) => a.alt.localeCompare(b.alt));

const previewImages: GalleryImage[] = [
  { src: gebbaImg, alt: "Guests enjoying a Cape Town stop" },
  { src: capeImg, alt: "Cape of Good Hope coastline" },
  { src: sealImg, alt: "Cape fur seal" },
  { src: pengiImg, alt: "Boulders Beach penguins" },
  { src: boatImg, alt: "Cape Town boat tour" },
  { src: wineImg, alt: "Cape Winelands estate" },
  { src: sunsetImg, alt: "Cape Town sunset tour" },
];

const previewSpans = ["row-span-2 col-span-2", "col-span-2", "row-span-2", "", "", ""];

export default function Gallery({ preview = false }: { preview?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const images = useMemo(() => {
    if (!preview) {
      return allImages;
    }

    return previewImages.map((image, index) => ({
      ...image,
      span: previewSpans[index] ?? "",
    }));
  }, [preview]);

  return (
    <section id="gallery" className={preview ? "bg-background" : "bg-background py-24 lg:py-32"}>
      {preview ? (
        <TiltedGridHero
          images={images}
          className="h-[clamp(400px,78svh,500px)] w-full bg-background sm:h-[520px] lg:h-[560px]"
        >
          <div className="relative z-10 flex h-full flex-col items-center justify-between px-4 pb-6 pt-14 text-center sm:px-5 sm:pb-8 sm:pt-20 lg:pt-24">
            <div className="px-5">
              <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                Every frame,
                <br />
                brought into focus.
              </h2>
            </div>
            <p className="max-w-md text-balance text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Images curve in from one edge, flatten out at the centre, then fade away round the
              other.
            </p>
          </div>
        </TiltedGridHero>
      ) : (
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeader
            as="h1"
            eyebrow="Gallery"
            title="Cape Town, through our lens."
            sub="A glimpse of the landscapes, wildlife and moments that make the Cape unforgettable."
          />

          <div className="mt-14 grid grid-cols-2 auto-rows-[180px] gap-3 md:grid-cols-3 lg:grid-cols-4 lg:auto-rows-[220px]">
            {images.map((img, i) => (
              <motion.button
                key={i}
                disabled={!hydrated}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (i % 6) * 0.04 }}
                onClick={() => setOpen(img.src)}
                className={`group relative overflow-hidden rounded-xl ${img.span ?? ""}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-navy/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(open)}
        onOpenChange={(value) => {
          if (!value) setOpen(null);
        }}
      >
        <DialogContent className="z-[70] w-auto max-w-[95vw] border-0 bg-transparent p-0 shadow-none sm:max-w-[95vw] [&>button]:bg-background [&>button]:text-foreground [&>button]:rounded-full [&>button]:p-2">
          <DialogTitle className="sr-only">Cape Town travel photograph</DialogTitle>
          <DialogDescription className="sr-only">
            Explore the full photograph. Press Escape or close to return to the gallery.
          </DialogDescription>
          {open && (
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={open}
              alt={images.find((image) => image.src === open)?.alt || "Cape Town travel moment"}
              className="max-h-[85svh] max-w-[90vw] rounded-xl object-contain shadow-glow"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
