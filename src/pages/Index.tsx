import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import OccasionsGrid from "@/components/OccasionsGrid";
import ValueProps from "@/components/ValueProps";
import Footer from "@/components/Footer";
import AIChatOverlay from "@/components/AIChatOverlay";

const Index = () => {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash === "#shop-by-occasion") {
      const el = document.getElementById("shop-by-occasion");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Open AI chat when arriving with ?create=1 (e.g. "Create Your Own" in header)
  useEffect(() => {
    if (location.pathname === "/" && location.search.includes("create=1")) {
      setAiChatOpen(true);
      navigate("/", { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OccasionsGrid onOpenGenerateWithAI={() => setAiChatOpen(true)} />
      <HeroSection onOpenGenerateWithAI={() => setAiChatOpen(true)} />
      <ValueProps />
      <Footer />
      <AIChatOverlay open={aiChatOpen} onOpenChange={setAiChatOpen} initialOccasion={null} />
    </div>
  );
};

export default Index;
