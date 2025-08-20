import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Beer } from "../types";
import EntryCard from "./EntryCard";
import ConfettiEffect from "./ConfettiEffect";
import CommentBubbles from "./CommentBubbles";
import { generateSampleComments } from "../utils/commentGenerator";

type FinaleStep = "header" | "bronze" | "silver" | "gold" | "complete";

type Props = {
  winners: Beer[];
  onComplete: () => void;
  onPrevious: () => void;
  active: boolean;
};

/**
 * Grand champion finale component with immersive full-screen treatment
 */
export default function FinaleReveal({
  winners,
  onComplete,
  onPrevious,
  active,
}: Props) {
  const [step, setStep] = useState<FinaleStep>("header");
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Get winners
  const champion = winners[0] || null;
  const silverMedalist = winners[1] || null;
  const bronzeMedalist = winners[2] || null;

  // Refs for scrolling
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Preload images
  useEffect(() => {
    if (!active || imagesLoaded) return;

    const imagesToLoad = winners
      .filter((beer) => beer.img)
      .map((beer) => beer.img as string);

    if (imagesToLoad.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;

    imagesToLoad.forEach((imgUrl) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
          setImagesLoaded(true);
        }
      };
      img.src = imgUrl;
    });
  }, [active, winners, imagesLoaded]);

  // Handle scrolling to active element
  useEffect(() => {
    if (!active) return;

    const targetRef = step === "header" ? headerRef.current : heroRef.current;

    if (targetRef) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      targetRef.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }

    // Debug log
    console.log(`FinaleReveal - Current step: ${step}`, {
      active,
      hasGold: !!champion,
      hasSilver: !!silverMedalist,
      hasBronze: !!bronzeMedalist,
      imagesLoaded,
      showConfetti,
    });
  }, [
    step,
    active,
    champion,
    silverMedalist,
    bronzeMedalist,
    imagesLoaded,
    showConfetti,
  ]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (!imagesLoaded) return;

    switch (step) {
      case "header":
        if (bronzeMedalist) {
          setStep("bronze");
        } else if (silverMedalist) {
          setStep("silver");
        } else if (champion) {
          setStep("gold");
          setShowConfetti(true);
        } else {
          setStep("complete");
        }
        break;
      case "bronze":
        if (silverMedalist) {
          setStep("silver");
        } else if (champion) {
          setStep("gold");
          setShowConfetti(true);
        } else {
          setStep("complete");
        }
        break;
      case "silver":
        if (champion) {
          setStep("gold");
          setShowConfetti(true);
        } else {
          setStep("complete");
        }
        break;
      case "gold":
        setStep("complete");
        setShowConfetti(false);
        break;
      case "complete":
        onComplete();
        break;
    }
  }, [
    step,
    imagesLoaded,
    bronzeMedalist,
    silverMedalist,
    champion,
    onComplete,
  ]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    switch (step) {
      case "header":
        onPrevious();
        break;
      case "bronze":
        setStep("header");
        break;
      case "silver":
        if (bronzeMedalist) {
          setStep("bronze");
        } else {
          setStep("header");
        }
        break;
      case "gold":
        setShowConfetti(false);
        if (silverMedalist) {
          setStep("silver");
        } else if (bronzeMedalist) {
          setStep("bronze");
        } else {
          setStep("header");
        }
        break;
      case "complete":
        if (champion) {
          setStep("gold");
          setShowConfetti(true);
        } else if (silverMedalist) {
          setStep("silver");
        } else if (bronzeMedalist) {
          setStep("bronze");
        } else {
          setStep("header");
        }
        break;
    }
  }, [step, bronzeMedalist, silverMedalist, champion, onPrevious]);

  // Keyboard navigation when active
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, handleNext, handlePrevious]);

  // Use opacity to dim out section when not active
  const opacity = active ? 1 : 0.4;

  return (
    <div
      className={`w-full min-h-screen py-10 transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-40"
      }`}
    >
      {/* Ambient Background with Bokeh Effect */}
      {active && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Vignette */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/70" />

          {/* Bokeh particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full bg-yellow-300/20 blur-lg`}
              animate={{
                x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{
                width: 30 + Math.random() * 70,
                height: 30 + Math.random() * 70,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Finale Header */}
      <motion.div
        ref={headerRef}
        className="w-full text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: opacity, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative inline-block">
          <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 py-6 px-10 rounded-xl shadow-xl">
            <h2 className="text-5xl font-serif font-bold text-amber-200">
              🏆 Grand Champion
            </h2>
            {step === "header" && (
              <p className="mt-4 text-xl text-amber-100">
                And now, the moment we've all been waiting for...
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hero Area */}
      <div
        ref={heroRef}
        className="w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] max-h-[65vh] md:max-h-[70vh] py-8 relative"
      >
        <AnimatePresence mode="wait">
          {/* Bronze Medal */}
          {step === "bronze" && bronzeMedalist && (
            <motion.div
              key="bronze"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
              }}
              className="w-full flex flex-col items-center"
            >
              <h3 className="text-3xl font-serif font-bold text-amber-300 mb-6">
                3rd Place
              </h3>
              <EntryCard
                beer={bronzeMedalist}
                size="hero"
                place={3}
                categoryName="Overall"
                showMedal={true}
              />
            </motion.div>
          )}

          {/* Silver Medal */}
          {step === "silver" && silverMedalist && (
            <motion.div
              key="silver"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
              }}
              className="w-full flex flex-col items-center"
            >
              <h3 className="text-3xl font-serif font-bold text-amber-300 mb-6">
                2nd Place
              </h3>
              <EntryCard
                beer={silverMedalist}
                size="hero"
                place={2}
                categoryName="Overall"
                showMedal={true}
              />
            </motion.div>
          )}

          {/* Gold Medal / Champion */}
          {step === "gold" && champion && (
            <motion.div
              key="gold"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
              }}
              className="w-full flex flex-col items-center"
            >
              <h3 className="text-4xl font-serif font-bold text-amber-300 mb-6">
                Grand Champion
              </h3>
              <EntryCard
                beer={champion}
                size="hero"
                place={1}
                categoryName="Overall"
                showMedal={true}
              />
              <div className="mt-8 text-center">
                <h4 className="text-2xl font-bold text-amber-100">
                  {champion.brewer}
                </h4>
                <p className="text-xl text-amber-200/80 mt-2">
                  {champion.style || "Homebrewer Extraordinaire"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Complete / Next Steps */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full text-center"
            >
              <h3 className="text-3xl font-serif font-bold text-amber-200 mb-6">
                Congratulations to all our winners!
              </h3>
              <p className="text-xl text-amber-100 mb-8">
                The complete results are now available.
              </p>
              <motion.button
                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-lg shadow-xl text-xl"
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments Overlay for Hero Cards */}
        {(step === "bronze" || step === "silver" || step === "gold") && (
          <div className="absolute inset-0 z-20">
            <CommentBubbles
              key={`${step}-${
                step === "bronze"
                  ? bronzeMedalist?.entryId
                  : step === "silver"
                  ? silverMedalist?.entryId
                  : champion?.entryId
              }`}
              comments={
                step === "bronze" && bronzeMedalist
                  ? generateSampleComments(bronzeMedalist)
                  : step === "silver" && silverMedalist
                  ? generateSampleComments(silverMedalist)
                  : step === "gold" && champion
                  ? generateSampleComments(champion)
                  : []
              }
              active={true}
              maxBubbles={4}
              displayDuration={12000}
              spacerDuration={2000}
            />
          </div>
        )}
      </div>

      {/* Confetti Effect - Only shown during gold reveal */}
      <ConfettiEffect
        active={showConfetti && step === "gold"}
        duration={null} // No duration - confetti stays active as long as step is "gold"
        onComplete={() => {}}
        showTestButton={active} // Only show test button when component is active
        intensity="grand"
      />

      {/* Loading indicator */}
      {active && !imagesLoaded && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-slate-800 rounded-lg px-8 py-4 shadow-lg">
            <p className="text-white text-xl">Loading assets...</p>
          </div>
        </div>
      )}

      {/* Navigation Controls (only visible when active) */}
      {active && step !== "complete" && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-6 z-40">
          <button
            className="bg-slate-800/80 hover:bg-slate-700 text-white rounded-full p-3 shadow-lg backdrop-blur-sm"
            onClick={handlePrevious}
            aria-label="Previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className="bg-amber-600/80 hover:bg-amber-500 text-white rounded-full p-3 shadow-lg backdrop-blur-sm"
            onClick={handleNext}
            aria-label="Next"
            disabled={!imagesLoaded}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
