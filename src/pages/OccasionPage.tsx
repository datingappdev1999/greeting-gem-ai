import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TemplateCustomiseSheet from "@/components/TemplateCustomiseSheet";
import AIChatOverlay from "@/components/AIChatOverlay";
import { OCCASIONS, type Occasion, type TemplateCard } from "@/lib/occasionsData";

function getOccasion(slug: string | undefined): Occasion | undefined {
  if (!slug) return undefined;
  return OCCASIONS.find((o) => o.slug === slug);
}

function getEasterTemplate2Variant(tpl: TemplateCard, occasionSlug: string | undefined): TemplateCard {
  if (occasionSlug !== "easter") return tpl;
  return tpl;
}

const OccasionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const occasion = getOccasion(slug);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateCard | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const handleTemplateClick = (tpl: TemplateCard) => {
    setSelectedTemplate(getEasterTemplate2Variant(tpl, occasion?.slug));
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) setSelectedTemplate(null);
  };

  const handleContinue = (payload: {
    template: TemplateCard;
    message: string;
    photoUrl: string | null;
    insideLeftMessage?: string;
    insideRightMessage?: string;
    backMessage?: string;
    flowerId: string | null;
    chocolateId: string | null;
  }) => {
    if (occasion) {
      navigate(`/occasions/${occasion.slug}/customise/${payload.template.id}`);
    }
  };

  if (!occasion) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="font-display text-2xl text-foreground mb-3">
            Occasion not found
          </h1>
          <p className="text-muted-foreground mb-6">
            The occasion you are looking for does not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-16">
        <Link
          to="/#shop-by-occasion"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to occasions
        </Link>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid items-center gap-8 md:grid-cols-[1.3fr,1fr] mb-16"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Shop by occasion
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">
              {occasion.heroTitle}
            </h1>
            <p className="text-muted-foreground max-w-xl mb-4">
              {occasion.heroSubtitle}
            </p>
            {occasion.highlightText && (
              <p className="text-sm font-medium text-foreground/90">
                {occasion.highlightText}
              </p>
            )}
            <button
              type="button"
              onClick={() => setAiChatOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Generate with AI
            </button>
          </div>
          <div className="overflow-hidden rounded-xl shadow-card">
            <img
              src={occasion.heroImageUrl}
              alt={occasion.name}
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>
        </motion.section>

        {/* Templates grid */}
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 className="font-display text-xl md:text-2xl text-foreground">
              All custom templates
            </h2>
            <p className="text-sm text-muted-foreground">
              {occasion.templates.length} design
              {occasion.templates.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasion.templates.map((tpl, i) => (
              <motion.article
                key={tpl.id}
                role="button"
                tabIndex={0}
                onClick={() => handleTemplateClick(tpl)}
                onKeyDown={(e) => e.key === "Enter" && handleTemplateClick(tpl)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card hover:shadow-elevated transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={tpl.imageUrl}
                    alt={tpl.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {tpl.primaryStyle && (
                    <span className="absolute left-3 top-3 rounded-full bg-card/95 backdrop-blur-sm px-3 py-1 text-[11px] font-medium capitalize text-foreground shadow-sm">
                      {tpl.primaryStyle.replace(/-/g, " ")}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base font-medium text-foreground">
                    {tpl.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {tpl.shortDescription}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tpl.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/occasions/${occasion.slug}/customise/${tpl.id}`}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Customise
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <TemplateCustomiseSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        template={selectedTemplate}
        occasionName={occasion?.name ?? null}
        onContinue={handleContinue}
      />
      <AIChatOverlay
        open={aiChatOpen}
        onOpenChange={setAiChatOpen}
        initialOccasion={occasion ? { slug: occasion.slug, name: occasion.name } : null}
      />
    </div>
  );
};

export default OccasionPage;
