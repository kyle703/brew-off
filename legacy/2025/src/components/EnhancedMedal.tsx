import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Medal from "./Medal";

type Props = {
  place: 1 | 2 | 3;
  size?: number;
  animate?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
};

/**
 * Enhanced medal component with drop-in and shine animations
 */
export default function EnhancedMedal({
  place,
  size = 120,
  animate = true,
  onAnimationComplete,
  className = "",
}: Props) {
  const [showShine, setShowShine] = useState(false);
  const medalRef = useRef<HTMLDivElement>(null);

  // Variants for the medal drop animation
  const dropVariants = {
    hidden: {
      y: -100,
      rotate: -8,
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      y: 0,
      rotate: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        mass: 1.2,
      },
    },
  };

  // Handle the shine effect after landing
  useEffect(() => {
    if (!animate) return;

    const timer = setTimeout(() => {
      setShowShine(true);

      // Notify when animation is complete
      const completeTimer = setTimeout(() => {
        onAnimationComplete?.();
      }, 600);

      return () => clearTimeout(completeTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [animate, onAnimationComplete]);

  return (
    <motion.div
      ref={medalRef}
      className={`relative ${className}`}
      variants={animate ? dropVariants : undefined}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
    >
      {/* Medal component */}
      <Medal place={place} size={size} />

      {/* Shine effect overlay */}
      {showShine && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/80 to-white/0"
          initial={{ x: -size, y: -size, opacity: 0 }}
          animate={{ x: size, y: size, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onAnimationComplete={() => setShowShine(false)}
        />
      )}

      {/* Bavarian ribbon tabs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-[15%] bg-blue-900 -z-10">
        <div
          className="absolute top-0 left-1/4 w-[40%] h-full bg-yellow-500"
          style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }}
        />
      </div>
    </motion.div>
  );
}
