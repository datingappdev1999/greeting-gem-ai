import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long will my order take?",
    answer:
      "Between 1–3 working days (Royal Mail First Class).",
  },
  {
    question: "What's your returns policy?",
    answer:
      "We don't do returns, but please contact alex@telemachus.io if you have any queries or complaints.",
  },
];

const FAQPage = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="container py-16 max-w-2xl flex-1">
      <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
        Frequently Asked Questions
      </h1>
      <p className="text-muted-foreground mb-10">
        Everything you need to know about ordering with Velvet Postbox.
      </p>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-medium text-foreground">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
    <Footer />
  </div>
);

export default FAQPage;
