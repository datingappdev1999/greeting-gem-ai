import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-[420px] md:h-[520px] lg:h-[580px]">
        <img
          src={heroBanner}
          alt="Beautiful collection of handcrafted greeting cards"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-lg"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                <span className="text-xs font-medium text-primary-foreground">AI-Powered Personalisation</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight mb-4">
                Cards that say exactly what you mean
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/80 mb-8 max-w-md font-body">
                Craft heartfelt, personalised greeting cards for every moment that matters. Powered by AI, made with love.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#occasions"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity shadow-elevated"
                >
                  Browse Cards
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card/20 backdrop-blur-sm text-primary-foreground font-medium text-sm border border-primary-foreground/20 hover:bg-card/30 transition-colors"
                >
                  Create Your Own
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
