import { tourSeo } from "@/lib/seo";
import { DETAILED_TOURS } from "@/data/site";
import tourImage from "@/assets/tour-wine.jpg";
import { createFileRoute } from "@tanstack/react-router";
import DetailedTourPage from "@/components/DetailedTourPage";
import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/stellenbosch-wine-tour")({
  component: StellenboschWineTourPage,
  head: () =>
    tourSeo(
      DETAILED_TOURS.winelands,
      "Private Cape Winelands Tour | RA2 Travel & Tours",
      "Explore Stellenbosch and Franschhoek with private transport and a tailored estate itinerary. Plan your Cape Winelands experience with RA2.",
      "/stellenbosch-wine-tour",
      tourImage,
    ),
});

function StellenboschWineTourPage() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <DetailedTourPage tourKey="winelands" />
      <Booking defaultService="cape-winelands" />
      <Partners />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
