import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AboutPage = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="container py-16 max-w-3xl flex-1">
      <h1 className="font-display text-3xl md:text-4xl text-foreground mb-6">
        About
      </h1>
      <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
        Velvet PostBox is a personalised and AI-powered greeting cards business.
        It&apos;s also a part of Telemachus Group - a business that builds
        companies in a novel way. It finds existing businesses which are good in
        the sense that they make lots of money, but bad in the sense that their
        operations are very far from the frontier of efficiency (ever more so
        thanks to AI)
      </p>
    </main>
    <Footer />
  </div>
);

export default AboutPage;
