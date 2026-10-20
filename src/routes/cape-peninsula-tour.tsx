import { tourSeo } from "@/lib/seo";
import { CAPE_PENINSULA_TOUR } from "@/data/site";
import tourImage from "@/assets/tour-peninsula.jpg";
import { createFileRoute } from "@tanstack/react-router";
import CapePeninsulaTour from "@/components/CapePeninsulaTour";
import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/cape-peninsula-tour")({
  component: CapePeninsulaTourPage,
  head: () =>
    tourSeo(
      CAPE_PENINSULA_TOUR,
      "Private Cape Peninsula Tour | RA2 Travel & Tours",
      "Discover Cape Point, Boulders Beach, Hout Bay and Chapman's Peak on a private Cape Peninsula tour with RA2. Request a personalised quote.",
      "/cape-peninsula-tour",
      tourImage,
    ),
});

function CapePeninsulaTourPage() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <CapePeninsulaTour />
      <Booking defaultService="cape-peninsula-tour" />
      <Partners />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
