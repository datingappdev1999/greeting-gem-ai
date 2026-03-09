import { motion } from "framer-motion";
import mothersDay from "@/assets/mothers-day.jpg";
import easter from "@/assets/easter.jpg";
import fathersDay from "@/assets/fathers-day.jpg";
import wedding from "@/assets/wedding.jpg";
import newBaby from "@/assets/new-baby.jpg";
import condolences from "@/assets/condolences.jpg";

const occasions = [
  { title: "Mother's Day", image: mothersDay, color: "bg-coral-light", accent: "text-coral" },
  { title: "Easter", image: easter, color: "bg-lavender-light", accent: "text-lavender" },
  { title: "Father's Day", image: fathersDay, color: "bg-sky-light", accent: "text-sky" },
  { title: "Weddings", image: wedding, color: "bg-gold-light", accent: "text-gold" },
  { title: "New Baby", image: newBaby, color: "bg-sage-light", accent: "text-sage" },
  { title: "Condolences", image: condolences, color: "bg-rose-light", accent: "text-rose" },
];

const OccasionsGrid = () => {
  return (
    <section id="occasions" className="py-16 md:py-24">
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
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {occasions.map((occasion, i) => (
            <motion.a
              key={occasion.title}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={occasion.image}
                  alt={`${occasion.title} greeting cards`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className={`absolute inset-x-0 bottom-0 p-4 ${occasion.color}/90 backdrop-blur-sm`}>
                <h3 className={`font-display text-lg ${occasion.accent} font-normal`}>
                  {occasion.title}
                </h3>
                <p className="text-xs text-foreground/70 mt-0.5">Explore collection →</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionsGrid;
