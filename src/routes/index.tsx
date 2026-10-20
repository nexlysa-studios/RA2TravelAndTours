import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServiceOptions from "@/components/ServiceOptions";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import CapeTownCityTourSection from "@/components/CapeTownCityTourSection";
import Tours from "@/components/Tours";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Gallery from "@/components/Gallery";
import Booking from "@/components/Booking";
import FAQ from "@/components/FAQ";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

import { SITE, FAQS } from "@/data/site";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    ...pageSeo(
      "Private Cape Town Tours | RA2 Travel & Tours",
      SITE.description,
      "/",
    ),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "TravelAgency",
              "@id": SITE.url + "/#business",
              name: SITE.name,
              url: SITE.url,
              description: SITE.description,
              telephone: SITE.phoneRaw,
              email: SITE.email,
              areaServed: [
                { "@type": "City", name: "Cape Town" },
                { "@type": "Country", name: "South Africa" },
              ],
              address: {
                "@type": "PostalAddress",
                streetAddress: "10 Kestel Street, Plumstead",
                addressLocality: "Cape Town",
                addressRegion: "Western Cape",
                addressCountry: "ZA",
              },
              sameAs: [SITE.facebook, SITE.instagram],
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
});

function Index() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <main id="main-content">
        <Hero />
        <ServiceOptions />
        <Services />
        <WhyUs />
        <CapeTownCityTourSection />
        <Tours />
        <About />
        <Testimonials />
        <Gallery preview />
        <Booking />
        <FAQ />
        <Partners />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
