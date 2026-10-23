import { pageSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { TravelHeader, TravelFooter } from "@/components/home/TravelChrome";
import GalleryExperience from "@/components/gallery/GalleryExperience";
import "@/components/home/travel.css";
import "@/components/gallery/gallery.css";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () =>
    pageSeo(
      "Cape Town Travel Gallery | RA2 Travel & Tours",
      "Discover Cape Town scenery, wildlife, coastal journeys and Winelands moments in the RA2 Travel & Tours gallery.",
      "/gallery",
    ),
});

function GalleryPage() {
  return (
    <div className="bg-background text-foreground">
      <TravelHeader />
      <main id="main-content">
        <GalleryExperience />
      </main>
      <TravelFooter />
      <FloatingWhatsApp />
    </div>
  );
}
