import { Sparkles } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground py-12">
    <div className="container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display text-lg">Velvet Postbox</span>
          </div>
          <p className="text-sm text-primary-foreground/60">
            AI-powered greeting cards for every moment that matters.
          </p>
        </div>
        {[
          { title: "Shop", links: ["All Cards", "Occasions", "Gifts", "Flowers"] },
          { title: "Help", links: ["Delivery", "Returns", "FAQs", "Contact"] },
          { title: "Company", links: ["About", "Careers", "Press", "Blog"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-primary-foreground/60 hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
        © 2026 Velvet Postbox. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
