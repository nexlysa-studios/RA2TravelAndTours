import { pageSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
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
      <Navbar forceTransformed />
      <main id="main-content">
        <Gallery />
        <Partners />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
