import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { TRAVEL_STYLES } from "@/data/site";

export default function TravelYourWay() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = TRAVEL_STYLES[selectedIndex];
  return (
    <section className="py-24 lg:py-32 bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-ocean opacity-90" />
      <div className="relative mx-auto max-w-5xl px-5 lg:px-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          There is no one way to travel
        </span>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold">
          Just the way that feels like you.
        </h2>
        <div className="mt-10 min-h-[280px]">
          <Compass className="mx-auto h-10 w-10 text-gold/70" />
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="pt-8"
            >
              <h3 className="font-display text-xl text-gold">
                {current.title}
              </h3>
              <p className="mt-5 mx-auto max-w-3xl text-xl sm:text-2xl font-display leading-relaxed text-white/90">
                {current.text}
              </p>
              <p className="mt-6 text-sm text-white/60">{current.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            onClick={() =>
              setSelectedIndex(
                (i) => (i - 1 + TRAVEL_STYLES.length) % TRAVEL_STYLES.length,
              )
            }
            aria-label="Previous travel style"
            className="h-11 w-11 rounded-full border border-white/25 hover:bg-white/10 grid place-items-center"
          >
            <ChevronLeft />
          </button>
          <div className="flex gap-2">
            {TRAVEL_STYLES.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setSelectedIndex(i)}
                aria-label={s.title}
                aria-pressed={selectedIndex === i}
                className={`h-2 rounded-full transition-all ${i === selectedIndex ? "w-8 bg-gold" : "w-2 bg-white/30"}`}
              />
            ))}
          </div>
          <button
            onClick={() =>
              setSelectedIndex((i) => (i + 1) % TRAVEL_STYLES.length)
            }
            aria-label="Next travel style"
            className="h-11 w-11 rounded-full border border-white/25 hover:bg-white/10 grid place-items-center"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
