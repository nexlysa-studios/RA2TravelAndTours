import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { FEATURES, STATS } from "@/data/site";
import { SectionHeader, Reveal } from "./Section";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.floor(p * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function WhyUs() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="The RA2 difference"
          title="Thoughtful travel. From start to finish."
          sub="Personal service, local knowledge and the freedom to experience South Africa your way."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.04}>
              <div className="h-full p-6 rounded-2xl bg-card border border-border hover:shadow-elegant transition-shadow">
                <div className="h-9 w-9 rounded-full bg-accent/15 text-accent grid place-items-center mb-4">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 rounded-3xl bg-gradient-ocean p-10 lg:p-14 shadow-elegant"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-white">
            {STATS.map((s) => (
              <div key={s.label}>
                <div
                  className={`font-display font-bold text-4xl lg:text-5xl text-gold ${
                    s.label === "Years Experience"
                      ? "translate-x-2 sm:translate-x-0"
                      : ""
                  }`}
                >
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-white/80 text-sm font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
