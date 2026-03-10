import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FLOWER_BOUQUETS } from "@/lib/addOnsData";

const FlowersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-16">
        <Link
          to="/#shop-by-occasion"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Gifts
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">
            Flowers
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Add a beautiful bouquet to your card. Hand-tied and wrapped with care, £20–£45.
          </p>
        </motion.section>

        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 className="font-display text-xl md:text-2xl text-foreground">
              All bouquets
            </h2>
            <p className="text-sm text-muted-foreground">
              {FLOWER_BOUQUETS.length} option{FLOWER_BOUQUETS.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FLOWER_BOUQUETS.map((bouquet, i) => (
              <motion.article
                key={bouquet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card hover:shadow-elevated transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={bouquet.imageUrl}
                    alt={bouquet.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base font-medium text-foreground">
                    {bouquet.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {bouquet.description}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-primary">
                    £{bouquet.price.toFixed(2)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FlowersPage;
