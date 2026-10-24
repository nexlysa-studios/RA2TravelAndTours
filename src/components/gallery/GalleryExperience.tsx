import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { galleryPhotos } from "@/data/gallery";

const photographs = galleryPhotos;
const categories = ["All frames", "Coast & ocean", "People & places", "Adventure", "Winelands"];

export default function GalleryExperience() {
  const [category, setCategory] = useState(categories[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const visible = photographs.filter(
    (photo) => category === categories[0] || photo.category === category,
  );
  const photo = selected === null ? null : visible[selected];
  const move = (direction: number) =>
    setSelected((current) =>
      current === null ? null : (current + direction + visible.length) % visible.length,
    );
  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (selected === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setSelected((current) =>
          current === null
            ? null
            : (current + (event.key === "ArrowRight" ? 1 : -1) + visible.length) % visible.length,
        );
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, visible.length]);

  return (
    <>
      <section id="top" className="travel-gallery-hero travel-container">
        <a href="/" className="travel-gallery-back">
          <ArrowLeft size={14} />
          Back to the journey
        </a>
        <div className="travel-gallery-intro">
          <div>
            <p className="travel-eyebrow">The RA2 photo journal</p>
            <h1>
              Wish you
              <br />
              were <span>here.</span>
            </h1>
          </div>
          <div>
            <p>
              Big landscapes. Small discoveries.
              <br />
              The moments in between.
            </p>
            <p>
              A little window into the Cape, from its colourful streets to the edge of the ocean.
              Find a place you can picture yourself.
            </p>
            <a href="/#book" className="travel-text-link">
              Let's take you there <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
        <div className="travel-gallery-cover">
          <img src={galleryPhotos[0].src} alt={galleryPhotos[0].alt} fetchPriority="high" />
          <div>
            <MapPin size={14} />
            Cape Peninsula, South Africa<span>There's more around every corner.</span>
          </div>
        </div>
      </section>
      <section id="gallery" className="travel-gallery-collection travel-container">
        <div className="travel-gallery-toolbar">
          <div className="travel-filters" role="group" aria-label="Filter photographs">
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                disabled={!hydrated}
                aria-pressed={category === name}
                onClick={() => {
                  setCategory(name);
                  setSelected(null);
                }}
              >
                {name}
                <span>
                  {String(
                    photographs.filter((item) => name === categories[0] || item.category === name)
                      .length,
                  ).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
          <p role="status">{visible.length} photographs</p>
        </div>
        <div className="travel-gallery-masonry">
          {visible.map((item, index) => (
            <figure key={item.src} className={`travel-gallery-frame ${item.shape}`}>
              <button
                type="button"
                disabled={!hydrated}
                aria-label={`View photograph: ${item.title}`}
                onClick={(event) => {
                  lastTrigger.current = event.currentTarget;
                  setSelected(index);
                }}
              >
                <img src={item.src} alt={item.title} loading="lazy" />
                <span className="travel-image-arrow">
                  <ArrowUpRight size={22} />
                </span>
              </button>
              <figcaption>
                <span>{String(photographs.indexOf(item) + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.location}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="travel-gallery-end">
          <p>The next photograph could be yours.</p>
          <a href="/#book" className="travel-button">
            Make a little history <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <Dialog
        open={photo !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="travel-lightbox"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            lastTrigger.current?.focus();
          }}
        >
          <DialogTitle className="sr-only">Cape Town travel photograph</DialogTitle>
          <DialogDescription className="sr-only">
            Use the arrow buttons or left and right arrow keys to explore. Press Escape to close.
          </DialogDescription>
          {photo && (
            <>
              <img src={photo.src} alt={photo.title} className="travel-lightbox-image" />
              <div className="travel-lightbox-bottom">
                <div>
                  <h2>{photo.title}</h2>
                  <p>
                    {photo.location} · {(selected! + 1).toString().padStart(2, "0")} /{" "}
                    {visible.length.toString().padStart(2, "0")}
                  </p>
                </div>
                <div>
                  <button onClick={() => move(-1)} aria-label="Previous photograph">
                    <ArrowLeft size={21} />
                  </button>
                  <button onClick={() => move(1)} aria-label="Next photograph">
                    <ArrowRight size={21} />
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
