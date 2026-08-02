import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import DashboardPreview from "../components/landing/DashboardPreview";
import FeatureStrip from "../components/landing/FeatureStrip";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream font-body text-ink">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <FeatureStrip />
      <Footer />
    </div>
  );
}
