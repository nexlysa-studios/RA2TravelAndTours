import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Compass, Clock, Heart, MapPin } from "lucide-react";
import heroBackground from "@/assets/herobg.png";
import HeroTrustBadge from "@/components/ui/testimonial";

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden sm:items-end"
    >
      <motion.div
        className="absolute inset-0 overflow-hidden bg-black"
        style={{ scale: reduceMotion ? 1 : scale, transformOrigin: "center" }}
      >
        <img
          src={heroBackground}
          fetchPriority="high"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-5 pb-36 pt-32 text-center sm:pb-20 sm:pt-36 lg:px-8 lg:pb-28">
        <motion.p
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5 inline-flex rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 shadow-sm backdrop-blur-sm sm:text-xs"
        >
          Private tours · Travel experiences · Airport transfers · Adventure
        </motion.p>
        <motion.h1
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="hero-enter mt-0 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.05] text-white sm:mt-6 sm:text-5xl lg:text-7xl"
        >
          Discover Cape Town.
          <br />
          <span className="text-gold">Experience South Africa.</span>
        </motion.h1>

        <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
          Private tours, unforgettable adventures and personalised travel experiences designed
          around you.
        </p>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-3 justify-center"
        >
          <a
            href="#tours"
            className="px-7 py-4 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90 transition shadow-glow"
          >
            Explore Our Tours
          </a>
          <a
            href="#book"
            className="px-7 py-4 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white font-semibold hover:bg-white/20 transition"
          >
            Plan Your Trip
          </a>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-7"
        >
          <HeroTrustBadge />
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-6 left-1/2 grid w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 grid-cols-4 gap-2 sm:static sm:mt-10 sm:w-full sm:max-w-3xl sm:translate-x-0 sm:gap-4"
        >
          {[
            { icon: Clock, label: "24/7 WhatsApp" },
            { icon: Heart, label: "Made for You" },
            { icon: Compass, label: "Private Journeys" },
            { icon: MapPin, label: "Local Expertise" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex min-w-0 flex-col items-center gap-1.5 text-center text-[10px] font-medium leading-tight text-white/90 sm:flex-row sm:gap-2.5 sm:text-sm"
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 sm:h-9 sm:w-9">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <span className="whitespace-nowrap">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
