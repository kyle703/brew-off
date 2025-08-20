import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import type { Beer } from "../types";
import DriveImage from "./DriveImage";
import BavarianBanner from "./BavarianBanner";
import Medal from "./Medal";

type CardSize = "hero" | "podium" | "mini";

type Props = {
  beer: Beer;
  size: CardSize;
  place?: 1 | 2 | 3;
  categoryName?: string;
  onLoad?: () => void;
  showMedal?: boolean;
  className?: string;
  cardId?: string; // Used to track the same card across animations
};

/**
 * Card displaying a beer entry with image, banner, and optional medal
 */
export default function EntryCard({
  beer,
  size = "podium",
  place,
  categoryName,
  onLoad,
  showMedal = false,
  className = "",
  cardId,
}: Props) {
  const controls = useAnimation();

  // Start animation when component mounts
  useEffect(() => {
    controls.start(size);
  }, [controls, size]);

  // Size-based class configurations
  const sizeClasses = {
    hero: "w-[min(70vw,600px)] aspect-square",
    podium: "w-[420px] aspect-square",
    mini: "w-[240px] aspect-square",
  };

  // Animation variants
  const cardVariants = {
    initial: {
      scale: 0.92,
      y: 24,
      opacity: 0,
    },
    hero: {
      scale: 1,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
        mass: 1,
        delay: 0.1,
      },
    },
    podium: {
      scale: size === "hero" ? 0.41 : 1,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 25,
        mass: 1,
      },
    },
    mini: {
      scale: 1,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 25,
        mass: 1,
      },
    },
  };

  // Format score for display
  const formatScore = (score: number) =>
    Number.isFinite(score) ? score.toFixed(2) : "N/A";

  const categoryScore =
    categoryName &&
    beer.scores[categoryName.toLowerCase() as keyof typeof beer.scores];

  // Medal size adjustment
  const medalSize = size === "hero" ? 80 : 60;

  return (
    <motion.div
      className={`${sizeClasses[size]} relative ${className}`}
      variants={cardVariants}
      initial="initial"
      animate={controls}
      layoutId={cardId} // Use layoutId for continuous identity
    >
      {/* Card container with decorative border */}
      <div className="relative w-full h-full p-2 bg-slate-900 rounded-xl overflow-hidden shadow-lg border-2 border-slate-700/50">
        {/* Bavarian border decoration */}
        <div
          className="absolute inset-0 border-8 border-transparent rounded-xl"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(59, 130, 246, 0.2) 0, rgba(59, 130, 246, 0.2) 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)",
            backgroundClip: "padding-box",
            padding: "4px",
          }}
        />

        {/* Card inner content */}
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
          {/* Medal in top right corner */}
          {showMedal && place && (
            <div className="absolute top-2 right-2 z-50">
              <div className="p-1 bg-slate-800 rounded-full shadow-lg">
                <Medal place={place} size={medalSize} />
              </div>
            </div>
          )}

          {/* Image with bevel effect */}
          <div className="relative w-full h-[70%] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/20 pointer-events-none z-10" />
            {beer.img ? (
              <DriveImage
                driveIdOrUrl={beer.img}
                className="w-full h-full object-cover"
                alt={`${beer.name} [${beer.entryId}]`}
                onLoad={() => onLoad?.()}
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M5 22h14a2 2 0 0 0 2-2V9a1 1 0 0 0-1-1h-6a1 1 0 0 1-1-1V1a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Bavarian Banner */}
          <div className="absolute bottom-0 w-full">
            <BavarianBanner
              beerName={beer.name}
              entryId={beer.entryId}
              brewer={beer.brewer}
            />
          </div>

          {/* Badges */}
          {size === "hero" && (
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 px-4">
              {categoryScore !== undefined && (
                <div className="px-3 py-1 bg-slate-800 rounded-full text-slate-200 text-sm">
                  {categoryName}: {formatScore(categoryScore as number)}
                </div>
              )}
              <div className="px-3 py-1 bg-slate-800 rounded-full text-slate-200 text-sm">
                Votes: {beer.scores.votes}
              </div>
              {beer.style && (
                <div className="px-3 py-1 bg-slate-800 rounded-full text-slate-200 text-sm truncate max-w-[150px]">
                  {beer.style}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
