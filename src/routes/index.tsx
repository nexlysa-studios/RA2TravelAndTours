import { createFileRoute } from "@tanstack/react-router";
import Gallery from "@/components/Gallery";
import Booking from "@/components/Booking";
import { TravelHeader, TravelFooter } from "@/components/home/TravelChrome";
import {
  HomeHero,
  JourneyCollection,
  HomeStory,
  HomeTransfers,
  HomePlanning,
  HomeQuestions,
} from "@/components/home/HomeExperience";
import "@/components/home/travel.css";
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
    <div className="ra2-home bg-background text-foreground">
      <TravelHeader />
      <main id="main-content">
        <HomeHero />
        <JourneyCollection />
        <HomeStory />
        <HomeTransfers />
        <Gallery preview />
        <HomePlanning />
        <Booking />
        <HomeQuestions />
      </main>
      <TravelFooter />
      <FloatingWhatsApp />
    </div>
  );
}
