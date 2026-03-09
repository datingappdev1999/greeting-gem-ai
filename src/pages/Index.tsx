import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import OccasionsGrid from "@/components/OccasionsGrid";
import ValueProps from "@/components/ValueProps";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OccasionsGrid />
      <HeroSection />
      <ValueProps />
      <Footer />
    </div>
  );
};

export default Index;
