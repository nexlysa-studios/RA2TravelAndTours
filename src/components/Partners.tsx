import {
  Compass,
  Mountain,
  Plane,
  Grape,
  Binoculars,
  Waves,
} from "lucide-react";
const places = [
  { label: "Cape Town", icon: Mountain },
  { label: "Cape Peninsula", icon: Waves },
  { label: "Cape Winelands", icon: Grape },
  { label: "Safari escapes", icon: Binoculars },
  { label: "Garden Route", icon: Compass },
  { label: "Seamless arrivals", icon: Plane },
];
export default function Partners() {
  return (
    <section
      aria-label="Explore with RA2"
      className="overflow-hidden border-t border-border bg-secondary/50 py-10"
    >
      <div className="partners-carousel flex w-max items-center gap-12 px-6">
        {[...places, ...places].map(({ label, icon: Icon }, i) => (
          <div
            key={i}
            aria-hidden={i >= places.length}
            className="flex shrink-0 items-center gap-3 text-primary/70"
          >
            <Icon className="h-5 w-5" />
            <span className="font-display text-lg font-medium">{label}</span>
            <span className="ml-8 text-accent/50">&#10022;</span>
          </div>
        ))}
      </div>
    </section>
  );
}
