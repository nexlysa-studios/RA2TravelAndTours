import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Instagram, Menu, Phone } from "lucide-react";
import Brand from "@/components/Brand";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SITE, whatsappLink } from "@/data/site";

const links = [
  { href: "/#tours", label: "The journeys" },
  { href: "/#about", label: "Why RA2" },
  { href: "/#transfers", label: "Airport Transfers" },
  { href: "/gallery", label: "Gallery" },
];

export function TravelHeader() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pendingAnchor = useRef<URL | null>(null);
  useEffect(() => setHydrated(true), []);
  return (
    <header className="travel-header">
      <a href="#main-content" className="travel-skip">
        Skip to content
      </a>
      <div className="travel-header-inner">
        <a href="/" className="travel-brand" aria-label="RA2 Travel & Tours home">
          <Brand className="h-[76px]" />
          <span>
            Local roots.
            <br />
            Extraordinary routes.
          </span>
        </a>
        <nav aria-label="Main navigation" className="travel-desktop-nav">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="travel-button travel-header-cta" href="/#book">
          Plan my trip <ArrowUpRight size={16} />
        </a>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="travel-menu-button"
              aria-label="Open menu"
              disabled={!hydrated}
            >
              <Menu size={25} />
            </button>
          </DialogTrigger>
          <DialogContent
            className="travel-menu-content"
            onCloseAutoFocus={(event) => {
              const destination = pendingAnchor.current;
              if (!destination) return;
              event.preventDefault();
              pendingAnchor.current = null;
              // Wait for the modal's scroll lock to release before navigating.
              requestAnimationFrame(() => {
                window.history.pushState(
                  null,
                  "",
                  destination.pathname + destination.search + destination.hash,
                );
                const section = document.getElementById(
                  decodeURIComponent(destination.hash.slice(1)),
                );
                if (!section) return;
                section.setAttribute("tabindex", "-1");
                section.focus({ preventScroll: true });
                section.scrollIntoView({
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                  block: "start",
                });
              });
            }}
          >
            <DialogTitle className="font-display text-3xl">A little exploring?</DialogTitle>
            <DialogDescription>Find your next journey with RA2 Travel & Tours.</DialogDescription>
            <nav aria-label="Mobile navigation" className="travel-mobile-links">
              {[
                { href: "/", label: "Home" },
                ...links,
                { href: "/#book", label: "Plan my trip" },
              ].map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => {
                    const destination = new URL(link.href, window.location.href);
                    if (destination.pathname === window.location.pathname && destination.hash) {
                      event.preventDefault();
                      pendingAnchor.current = destination;
                    }
                    setOpen(false);
                  }}
                >
                  <span aria-hidden="true">0{index + 1}</span>
                  {link.label}
                  <ArrowUpRight size={20} />
                </a>
              ))}
            </nav>
            <a href={`tel:${SITE.phoneRaw}`} className="mt-4 flex items-center gap-2 text-sm">
              <Phone size={16} />
              {SITE.phone}
            </a>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

export function TravelFooter() {
  return (
    <footer className="travel-footer">
      <div className="travel-container">
        <div className="travel-footer-invitation">
          <div>
            <p className="travel-eyebrow">A little closer to your next adventure</p>
            <h2>
              See you in
              <br />
              <span>South Africa.</span>
            </h2>
          </div>
          <a
            className="travel-footer-arrow"
            href="/#book"
            aria-label="Plan your South African trip"
          >
            <ArrowUpRight />
          </a>
        </div>
        <div className="travel-footer-details">
          <div>
            <p className="travel-footer-name">RA2 Travel & Tours</p>
            <p>Your journey. Your South Africa.</p>
            <p className="mt-5">
              10 Kestel Street, Plumstead
              <br />
              Cape Town, South Africa
            </p>
          </div>
          <div>
            <p className="travel-eyebrow">Say hello</p>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={`tel:${SITE.phoneRaw}`}>{SITE.phone}</a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp <ArrowUpRight size={14} />
            </a>
          </div>
          <div>
            <p className="travel-eyebrow">Keep exploring</p>
            <a href="/packages">All experiences</a>
            <a href="/fleet">Our transport</a>
            <a href="/blog">The travel journal</a>
          </div>
          <div>
            <p className="travel-eyebrow">Follow the journey</p>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
              <Instagram size={16} />
              Instagram <ArrowUpRight size={14} />
            </a>
            <a href={SITE.facebook} target="_blank" rel="noopener noreferrer">
              Facebook <ArrowUpRight size={14} />
            </a>
            <a href="/#top">
              Back to the start <ArrowDown size={14} className="rotate-180" />
            </a>
          </div>
        </div>
        <div className="travel-footer-bottom">
          <p>© {new Date().getFullYear()} RA2 Travel & Tours</p>
          <p>Made for the way you travel.</p>
        </div>
      </div>
    </footer>
  );
}
