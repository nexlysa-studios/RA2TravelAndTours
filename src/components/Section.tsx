import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  sub,
  center = true,
  textColor = "text-foreground",
  subColor = "text-muted-foreground",
  className = "",
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
  textColor?: string;
  subColor?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl ${center ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow && (
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
          {eyebrow}
        </span>
      )}
      <Heading
        className={`font-display font-bold text-3xl sm:text-4xl lg:text-5xl ${textColor} text-balance`}
      >
        {title}
      </Heading>
      {sub && <p className={`mt-4 ${subColor} text-lg`}>{sub}</p>}
    </motion.div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
