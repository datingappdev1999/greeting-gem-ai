import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="container py-10 md:py-16 max-w-3xl flex-1">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-foreground"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Legal
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Privacy policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: 31 March 2026
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="font-display text-xl text-foreground mt-0">
            Who we are
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Velvet Postbox (“we”, “us”) provides personalised greeting cards and related
            products. This policy explains how we handle personal information when you use
            our website and services.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-display text-xl text-foreground">
            Information we collect
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We may collect information you provide directly (for example name, email address,
            delivery details, payment information processed by our payment partners, and card
            messages or images you choose to include). We also collect limited technical
            data (such as device type, browser, and approximate region) to operate and secure
            the site.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-display text-xl text-foreground">
            How we use information
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We use personal information to fulfil orders, communicate with you about your
            purchase, improve our products and website, comply with legal obligations, and
            protect against fraud or misuse. We do not sell your personal information.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-display text-xl text-foreground">
            Cookies and similar technologies
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We may use cookies or similar tools for essential site functionality, preferences,
            and analytics. You can control cookies through your browser settings where
            supported.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-display text-xl text-foreground">
            Retention and security
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We keep personal information only as long as needed for the purposes above and as
            required by law. We implement appropriate technical and organisational measures
            to protect data, though no online service can be guaranteed fully secure.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-display text-xl text-foreground">Your rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            Depending on where you live, you may have rights to access, correct, delete, or
            restrict processing of your personal data, or to object to certain processing. To
            exercise these rights, contact us using the details below.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-display text-xl text-foreground">
            Changes to this policy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this privacy policy from time to time. The “Last updated” date at
            the top will change when we do. Continued use of the site after changes means you
            accept the updated policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy questions or requests, please contact us through the details
            provided on our website or at the support email we publish for customer enquiries.
          </p>
        </section>
      </motion.article>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
