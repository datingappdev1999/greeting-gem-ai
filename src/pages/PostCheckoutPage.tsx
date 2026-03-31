import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const confettiColors = ["#CA2C21", "#F59E0B", "#2563EB", "#16A34A", "#9333EA"];

const pieces = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 97) % 100}%`,
  delay: (i % 9) * 0.12,
  duration: 2.2 + (i % 5) * 0.35,
  rotate: (i * 37) % 360,
  color: confettiColors[i % confettiColors.length],
}));

export default function PostCheckoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/");
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none">
        {pieces.map((piece) => (
          <motion.span
            key={piece.id}
            className="absolute top-[-10%] h-3 w-2 rounded-sm"
            style={{
              left: piece.left,
              backgroundColor: piece.color,
              rotate: `${piece.rotate}deg`,
            }}
            animate={{
              y: ["0vh", "120vh"],
              x: [0, (piece.id % 2 === 0 ? 14 : -14)],
              rotate: [`${piece.rotate}deg`, `${piece.rotate + 180}deg`],
              opacity: [0, 1, 1, 0.9],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.h1
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 text-center font-display text-3xl md:text-5xl text-[#CA2C21]"
      >
        <span className="block">Congratulations!</span>
        <span className="mt-10 block">Your order is on its way</span>
      </motion.h1>
    </div>
  );
}
