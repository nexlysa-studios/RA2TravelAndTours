import { pageSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Packages from "@/components/Packages";
import Booking from "@/components/Booking";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/packages")({
  component: PackagesPage,
  head: () =>
    pageSeo(
      "Experiences & Private Tours | RA2 Travel & Tours",
      "Explore private Cape Town tours, Aquila safari, the Cape Winelands, Garden Route, adventure activities and airport transfers. Request your personalised RA2 quote.",
      "/packages",
    ),
});

function PackagesPage() {
  return (
    <div className="bg-background text-foreground">
      <Navbar forceTransformed />
      <main id="main-content">
        <Packages />
        <Booking />
        <Partners />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
