import { SERVICES } from "@/data/site";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { SectionHeader } from "./Section";

export default function Services() {
  return (
    <section
      id="services"
      className="overflow-hidden bg-background py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="The art of travelling well"
          title="More than a destination. An experience."
          sub="From your first airport welcome to your last spectacular view, let us take care of the details."
        />

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: "var(--service-card-slide)", y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: "easeOut" }}
              className="h-full col-span-1"
              style={
                {
                  "--service-card-slide": i % 2 === 0 ? "-56px" : "56px",
                } as CSSProperties
              }
            >
              <div className="flex h-full flex-col items-center rounded-md border border-border/50 bg-card p-5 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl md:items-start md:rounded-[32px] md:p-7 md:text-left md:hover:-translate-y-2">
                <div className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent md:mb-4 md:h-11 md:w-11">
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <h3 className="font-display text-sm font-semibold leading-tight text-foreground sm:text-sm md:mb-3 md:text-lg">
                  {title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
