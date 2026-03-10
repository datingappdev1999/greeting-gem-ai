import { Heart, Search, ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/VP_logo.png";

const navLinks: { label: string; to: string }[] = [
  { label: "Cards", to: "/#shop-by-occasion" },
  { label: "Gifts", to: "/gifts/chocolates" },
  { label: "Flowers", to: "/gifts/flowers" },
  { label: "Occasions", to: "/#shop-by-occasion" },
  { label: "Create Your Own", to: "/?create=1" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Velvet Postbox" className="h-16 md:h-20 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Search className="w-5 h-5 text-foreground" />
          </button>
          <button className="hidden md:flex p-2 rounded-full hover:bg-secondary transition-colors">
            <Heart className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors relative">
            <ShoppingBag className="w-5 h-5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
          </button>
          <button
            className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={handleNavClick}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
