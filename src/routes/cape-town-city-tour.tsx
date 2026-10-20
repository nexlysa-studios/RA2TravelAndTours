import { pageSeo } from "@/lib/seo";
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
    pageSeo(
      "Private Cape Town City Tour | RA2 Travel & Tours",
      "Experience Table Mountain, Bo-Kaap and the V&A Waterfront on a private Cape Town city tour. Plan your personalised experience with RA2.",
      "/cape-town-city-tour",
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
