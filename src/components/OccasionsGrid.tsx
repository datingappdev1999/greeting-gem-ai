import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { OCCASIONS } from "@/lib/occasionsData";

const slugToStyles: Record<string, { color: string; accent: string }> = {
  "mothers-day": { color: "bg-coral-light", accent: "text-coral" },
  easter: { color: "bg-lavender-light", accent: "text-lavender" },
  "fathers-day": { color: "bg-sky-light", accent: "text-sky" },
  birthdays: { color: "bg-rose-light", accent: "text-rose" },
  weddings: { color: "bg-gold-light", accent: "text-gold" },
  "new-baby": { color: "bg-sage-light", accent: "text-sage" },
  condolences: { color: "bg-rose-light", accent: "text-rose" },
};

const OccasionsGrid = ({ onOpenGenerateWithAI }: { onOpenGenerateWithAI?: () => void }) => {
  const visibleOccasionsOrder = ["easter", "fathers-day", "birthdays"] as const;
  const visibleOccasions = visibleOccasionsOrder
    .map((slug) => OCCASIONS.find((o) => o.slug === slug))
    .filter((o): o is (typeof OCCASIONS)[number] => Boolean(o));

  return (
    <section id="shop-by-occasion" className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
            Shop by Occasion
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Find the perfect card for every life moment, personalised with AI to make it truly special.
          </p>
          <button
            type="button"
            onClick={() => onOpenGenerateWithAI?.()}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            Generate with AI
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {visibleOccasions.map((occasion, i) => {
            const styles = slugToStyles[occasion.slug] ?? {
              color: "bg-muted",
              accent: "text-foreground",
            };
            return (
              <motion.div
                key={occasion.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  to={`/occasions/${occasion.slug}`}
                  className="group relative block rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={occasion.heroImageUrl}
                      alt={`${occasion.name} greeting cards`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div
                    className={`absolute inset-x-0 bottom-0 p-4 ${styles.color} backdrop-blur-sm`}
                  >
                    <h3 className={`font-display text-lg ${styles.accent} font-normal`}>
                      {occasion.name}
                    </h3>
                    <p className="text-xs text-foreground/70 mt-0.5">Explore collection →</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OccasionsGrid;
