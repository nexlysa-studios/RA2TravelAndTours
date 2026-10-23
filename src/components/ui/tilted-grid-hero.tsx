import * as React from "react";
import { cn } from "@/lib/utils";

const SLICES = 16;
const CAMERA = 1.6;
const MAX_WIDTH = 55;

function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const h = Math.min((tile / 100) * height, ((MAX_WIDTH / 100) * width) / aspect);
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0)) {
    return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  }
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
  };
}

export type TiltedGridImage = {
  src: string;
  alt?: string;
};

type TiltedGridHeroProps = React.ComponentProps<"div"> & {
  images: TiltedGridImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: number;
  curve?: number;
  fade?: number;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  ...props
}: TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;
  const [layout, setLayout] = React.useState<ReturnType<typeof measure> | null>(null);
  const [shown, setShown] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const updateLayout = (width: number, height: number) => {
      if (!(width > 0) || !(height > 0)) return;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((prev) =>
        prev?.columns === next.columns && prev.sweep === next.sweep && prev.unit === next.unit
          ? prev
          : next,
      );
    };
    const measureElement = () => {
      const bounds = el.getBoundingClientRect();
      updateLayout(bounds.width, bounds.height);
    };

    measureElement();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureElement);
      return () => window.removeEventListener("resize", measureElement);
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateLayout(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  React.useEffect(() => {
    images.forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });
  }, [images]);

  const { columns, sweep, unit, limit } =
    layout ?? measure(1200, 520, tileHeight, aspectRatio, gap, bend);
  const u = (n: number) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${(MAX_WIDTH / aspectRatio).toFixed(4)}cqw))`;
  const radius = `${+(100 * arc(bend)).toFixed(3)}cqw`;
  const turn = (degrees: number) =>
    `translateZ(${radius}) rotateY(${+degrees.toFixed(4)}deg) translateZ(-${radius})`;
  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;
  const share = aspectRatio / SLICES;
  const duration = columns * speed;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "size", ...props.style }}
    >
      <style>{css}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: layout ? 1 : 0,
          perspective: `${+(100 * arc(bend) * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, index) => {
          const first = columns - 1 - index;
          const image = images.length ? images[(shown[index] ?? first) % images.length] : null;
          return (
            <div
              key={index}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                animationName: orbit,
                animationDuration: `${duration}s`,
                animationTimingFunction: "linear",
                animationDelay: `${-index * speed}s`,
                animationIterationCount: "infinite",
              }}
              onAnimationIteration={(event) => {
                const lap = Math.round(event.elapsedTime / duration);
                setShown((previous) => {
                  const next = lap * columns + first;
                  return previous[index] === next ? previous : { ...previous, [index]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, slice) => (
                <div
                  key={slice}
                  className={cn(
                    "absolute top-0 overflow-hidden bg-muted",
                    slice === 0 && "rounded-l-lg",
                    slice === SLICES - 1 && "rounded-r-lg",
                  )}
                  style={{
                    left: u((aspectRatio - share) / 2),
                    width: slice === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn((aspectRatio / 2 - (slice + 0.5) * share) * unit),
                  }}
                >
                  {image && (
                    <img
                      src={image.src}
                      alt=""
                      draggable={false}
                      className="absolute top-0 max-w-none object-cover"
                      style={{
                        left: u(-slice * share),
                        width: u(aspectRatio),
                        height: u(1),
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}

export default TiltedGridHero;
