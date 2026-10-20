import { pageSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Fleet from "@/components/Fleet";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/fleet")({
  component: FleetPage,
  head: () =>
    pageSeo(
      "Private Transport & Chauffeur Services | RA2 Travel & Tours",
      "Comfortable private transport for Cape Town airport transfers, tours, families, groups and executive travel. Arrange your journey with RA2.",
      "/fleet",
    ),
});

function FleetPage() {
  return (
    <div className="bg-background text-foreground">
      <Navbar forceTransformed />
      <main id="main-content">
        <Fleet />
        <Partners />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
