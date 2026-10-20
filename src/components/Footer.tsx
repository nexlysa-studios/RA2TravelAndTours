import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Facebook,
  Instagram,
  ArrowUpRight,
} from "lucide-react";
import { FEATURED_PACKAGES, NAV_LINKS, SITE, whatsappLink } from "@/data/site";
import Brand from "./Brand";

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-14 flex flex-col gap-6 border-b border-white/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Let's make it memorable</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Where will your story take you?
            </h2>
          </div>
          <a
            href="/#book"
            className="inline-flex items-center gap-2 self-start rounded-full bg-accent px-6 py-3.5 font-semibold text-white"
          >
            Plan your trip <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.9fr_1.3fr]">
          <div>
            <a href="/" aria-label="RA2 Travel & Tours home">
              <Brand light />
            </a>
            <p className="mt-5 text-white/70 text-sm leading-relaxed">
              Private tours, remarkable adventures and personalised journeys in Cape Town and across
              South Africa. Thoughtfully planned, warmly hosted.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                {
                  href: SITE.facebook,
                  label: "RA2 on Facebook",
                  icon: Facebook,
                },
                {
                  href: SITE.instagram,
                  label: "RA2 on Instagram",
                  icon: Instagram,
                },
                {
                  href: whatsappLink(),
                  label: "WhatsApp RA2",
                  icon: MessageCircle,
                },
              ].map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display font-semibold mb-5">Explore</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-gold transition">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/blog" className="hover:text-gold">
                  Travel Journal
                </a>
              </li>
              <li>
                <a href="/fleet" className="hover:text-gold">
                  Transport
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold mb-5">Your next experience</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {FEATURED_PACKAGES.map((item) => (
                <li key={item.slug}>
                  <a
                    href={item.detailPath || `/?service=${encodeURIComponent(item.slug)}#book`}
                    className="hover:text-gold"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold mb-5">Get in touch</h3>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex gap-3">
                <Phone className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <a href={`tel:${SITE.phoneRaw}`} className="hover:text-white">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <a href={`mailto:${SITE.email}`} className="hover:text-white break-all">
                  {SITE.email}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>
                  10 Kestel Street, Plumstead
                  <br />
                  Cape Town, South Africa
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Available 24/7 via WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 border-t border-white/15 pt-6 flex flex-col sm:flex-row gap-3 justify-between text-xs text-white/60">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>{SITE.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
