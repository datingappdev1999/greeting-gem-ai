import { motion } from "framer-motion";
import { Sparkles, Truck, Palette, Heart } from "lucide-react";

const props = [
  {
    icon: Sparkles,
    title: "AI Personalisation",
    desc: "Our AI helps you write the perfect message for any occasion.",
  },
  {
    icon: Palette,
    title: "Unique Designs",
    desc: "Thousands of beautiful cards from independent artists worldwide.",
  },
  {
    icon: Truck,
    title: "Next-Day Delivery",
    desc: "Order by 9pm and we'll have it on their doorstep tomorrow.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    desc: "Printed on premium stock with eco-friendly, sustainable materials.",
  },
];

const ValueProps = () => (
  <section className="py-16 bg-secondary">
    <div className="container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {props.map((prop, i) => (
          <motion.div
            key={prop.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <prop.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display text-base md:text-lg text-foreground mb-1">{prop.title}</h3>
            <p className="text-sm text-muted-foreground">{prop.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ValueProps;
