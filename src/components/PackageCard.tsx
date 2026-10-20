import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import type { PackageItem } from "@/data/site";
import safari from "@/assets/tour-safari.jpg";
import peninsula from "@/assets/tour-peninsula.jpg";
import city from "@/assets/tour-table.jpg";
import wine from "@/assets/tour-wine.jpg";
import garden from "@/assets/tour-westcoast.jpg";
import adventure from "@/assets/Heli-pilot.jpg";
import transfer from "@/images/sedan4.jpeg";
import custom from "@/assets/hero-capetown.jpg";

const images = {
  safari,
  peninsula,
  city,
  wine,
  garden,
  adventure,
  transfer,
  custom,
};

export default function PackageCard({ item }: { item: PackageItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
      <a
        href={item.detailPath || `/?service=${item.slug}#book`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block overflow-hidden"
      >
        <img
          src={images[item.image]}
          alt=""
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-background/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
          {item.category}
        </span>
      </a>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {item.location}
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
          {item.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {item.note}
        </p>
        <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {item.duration}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
          <span className="text-xs text-muted-foreground">Request a Quote</span>
          <a
            href={item.detailPath || `/?service=${item.slug}#book`}
            className="inline-flex items-center gap-2 text-sm font-bold text-accent"
          >
            {item.detailPath ? "View Experience" : "Book Now"}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
