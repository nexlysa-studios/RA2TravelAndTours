import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const travelerAvatars = [
  "https://cdn.21st.dev/assets/mirror/20/202f28d9108e13136b34315b1c8dac25678f9dc5cb2f004c713d930cf285e62c.jpg",
  "https://cdn.21st.dev/assets/mirror/ce/ce1536afd37b7d4e6c9ffbee65b35e6897d4467ab07efc9b6466b6c1744654f9.jpg",
  "https://cdn.21st.dev/assets/mirror/a5/a5daca55ac260069e7a61ad9126a5913eec37ca03cb8cbc29cc37f8d13d2d2dd.jpg",
  "https://cdn.21st.dev/assets/mirror/60/60c2053e9aa4900708d262ddb15313d1f5b9e5daad2c0f6ace8c41f4fd78a015.jpg",
];

type HeroTrustBadgeProps = {
  className?: string;
};

export default function HeroTrustBadge({ className }: HeroTrustBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center rounded-full border border-white/20 bg-black/25 px-3 py-2.5 text-left text-white shadow-sm backdrop-blur-sm sm:px-4",
        className,
      )}
      aria-label="Personalized tours with local expertise"
    >
      <div className="flex shrink-0 items-center -space-x-3 pr-3">
        {travelerAvatars.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-full border-2 border-white object-cover sm:h-10 sm:w-10"
            style={{ zIndex: travelerAvatars.length - index }}
          />
        ))}
      </div>
      <div className="border-l border-white/30 pl-3">
        <div className="flex items-center gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className="h-4 w-4 fill-gold text-gold" />
          ))}
        </div>
        <p className="mt-0.5 whitespace-nowrap text-xs text-white/85 sm:text-sm">
          Local guides <span className="text-white/50">·</span> Personal journeys
        </p>
      </div>
    </div>
  );
}
