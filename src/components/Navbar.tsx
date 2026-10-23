import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/data/site";
import Brand from "./Brand";
import CountrySelector from "./CountrySelector";
import StaggeredMenu from "./StaggeredMenu";

export default function Navbar({ forceTransformed = false }: { forceTransformed?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const transformed = forceTransformed || scrolled;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${transformed ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"}`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-background focus:p-3"
      >
        Skip to content
      </a>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-20 lg:h-24 flex items-center justify-between gap-4">
        <a href="/" aria-label="RA2 Travel & Tours home" className="shrink-0">
          <Brand className="h-16" />
        </a>
        <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`px-2.5 py-2 text-[13px] font-semibold rounded-full transition-colors ${transformed ? "text-foreground/80 hover:bg-secondary" : "text-white/90 hover:bg-white/10"}`}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="/#book"
          className="hidden sm:inline-flex xl:ml-0 ml-auto mr-12 xl:mr-0 shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-glow transition hover:opacity-90"
        >
          Book Now
        </a>
        <StaggeredMenu
          className="xl:hidden"
          position="right"
          items={[...NAV_LINKS, { href: "/#book", label: "Book Now" }].map((l) => ({
            label: l.label,
            ariaLabel: l.label,
            link: l.href,
          }))}
          displaySocials={false}
          displayItemNumbering={true}
          menuButtonColor={transformed ? "#153445" : "#fff"}
          openMenuButtonColor="#153445"
          colors={["#0797ce", "#153445"]}
          accentColor="#c42f32"
          isFixed={true}
          bottomContent={<CountrySelector />}
        />
      </div>
    </motion.header>
  );
}
