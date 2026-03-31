import { Link } from "react-router-dom";
import logo from "@/assets/velvet-postbox-logo.png";

const footerCols = [
  {
    title: "Shop",
    links: [
      { label: "All Cards", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQs", href: "/faq" },
      { label: "Contact", href: "mailto:alex@telemachus.io" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
    ],
  },
];

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground py-12">
    <div className="container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div>
          <div className="mb-4">
            <img src={logo} alt="Velvet Postbox" className="h-28 w-auto" />
          </div>
          <p className="text-sm text-primary-foreground/60">
            Personalised and AI-powered greeting cards for every moment that matters
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith("/") ? (
                    <Link to={href} className="text-sm text-primary-foreground/60 hover:text-primary transition-colors">
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className="text-sm text-primary-foreground/60 hover:text-primary transition-colors">
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-primary-foreground/40">
        <span>© 2026 Velvet Postbox. All rights reserved.</span>
        <span className="hidden sm:inline text-primary-foreground/20" aria-hidden>
          |
        </span>
        <Link
          to="/privacy"
          className="text-primary-foreground/50 hover:text-primary-foreground transition-colors underline-offset-2 hover:underline"
        >
          Privacy policy
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
