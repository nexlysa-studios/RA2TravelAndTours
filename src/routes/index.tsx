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
  head: () =>
    pageSeo("Private Cape Town Tours | RA2 Travel & Tours", SITE.description, "/", {
      schemas: [
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
