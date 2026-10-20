import { tourSeo } from "@/lib/seo";
import { DETAILED_TOURS } from "@/data/site";
import tourImage from "@/assets/tour-table.jpg";
import { createFileRoute } from "@tanstack/react-router";
import DetailedTourPage from "@/components/DetailedTourPage";
import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/cape-town-city-tour")({
  component: CapeTownCityTourPage,
  head: () =>
    tourSeo(
      DETAILED_TOURS.city,
      "Private Cape Town City Tour | RA2 Travel & Tours",
      "Experience Table Mountain, Bo-Kaap and the V&A Waterfront on a private Cape Town city tour. Plan your personalised experience with RA2.",
      "/cape-town-city-tour",
      tourImage,
    ),
});

function CapeTownCityTourPage() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <DetailedTourPage tourKey="city" />
      <Booking defaultService="cape-town-city-tour" />
      <Partners />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
