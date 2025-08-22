import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { LoadedData, WinnerCategory } from "../types";
import CategoryReveal from "./CategoryReveal";
import FinaleReveal from "./FinaleReveal";
import BeerCardScroll from "./BeerCardScroll";
import { Link } from "react-router-dom";
import { markRevealAsSeen } from "../utils/cookies";

type Section = "intro" | WinnerCategory | "overall" | "closing";

type Props = {
  data: LoadedData;
};

// Define the order of categories
const CATEGORY_ORDER: WinnerCategory[] = [
  "Label",
  "Color",
  "Drinkability",
  "Flavor",
];

/**
 * Main component for the reveal presentation
 * Manages the flow between different sections
 */
export default function RevealDeck({ data }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("intro");

  useEffect(() => {
    console.log("RevealDeck mounted with data:", {
      hasData: !!data,
      categories: Object.keys(data.winners),
      winners: Object.entries(data.winners).map(([cat, beers]) => ({
        category: cat,
        count: beers.length,
        entries: beers.map((b) => ({
          id: b.entryId,
          name: b.name,
          hasImg: !!b.img,
          img: b.img,
        })),
      })),
    });
  }, [data]);

  // Get current section index
  const getCurrentSectionIndex = (): number => {
    if (activeSection === "intro") return 0;
    if (CATEGORY_ORDER.includes(activeSection as WinnerCategory)) {
      return 1 + CATEGORY_ORDER.indexOf(activeSection as WinnerCategory);
    }
    if (activeSection === "overall") return CATEGORY_ORDER.length + 1;
    return CATEGORY_ORDER.length + 2; // closing
  };

  // Navigate to next section
  const handleNext = () => {
    const currentIndex = getCurrentSectionIndex();

    if (currentIndex === 0) {
      setActiveSection(CATEGORY_ORDER[0]);
    } else if (currentIndex <= CATEGORY_ORDER.length) {
      const nextCategoryIndex = currentIndex;
      if (nextCategoryIndex < CATEGORY_ORDER.length) {
        setActiveSection(CATEGORY_ORDER[nextCategoryIndex]);
      } else {
        setActiveSection("overall");
      }
    } else if (currentIndex === CATEGORY_ORDER.length + 1) {
      // After overall, go to closing
      setActiveSection("closing");
    } else if (currentIndex > CATEGORY_ORDER.length + 1) {
      // Already at or past closing; do nothing
    }
  };

  // Navigate to previous section
  const handlePrevious = () => {
    const currentIndex = getCurrentSectionIndex();

    if (currentIndex === 0) {
      return; // Already at intro, can't go back
    } else if (currentIndex === 1) {
      setActiveSection("intro");
    } else if (currentIndex <= CATEGORY_ORDER.length + 1) {
      const prevCategoryIndex = currentIndex - 1 - 1;
      setActiveSection(CATEGORY_ORDER[prevCategoryIndex]);
    } else {
      setActiveSection("overall");
    }
  };

  const closingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeSection !== "closing") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (closingRef.current) {
      closingRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen">
      {/* Introduction Section */}
      <motion.div
        className={`min-h-screen flex flex-col justify-center items-center p-4 ${
          activeSection !== "intro" ? "mb-32" : ""
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: activeSection === "intro" ? 1 : 0.4 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h1 className="text-6xl font-fraktur font-bold text-amber-200 mb-8">
            Brew-Off Results
          </h1>

          {/* Beer Card Horizontal Scroll */}
          <BeerCardScroll beers={data.beerList} />

          {activeSection === "intro" && (
            <motion.button
              className="mt-12 bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg shadow-lg text-xl"
              onClick={handleNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Begin the Reveal
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Category Sections */}
      {CATEGORY_ORDER.map((category) => {
        const categoryWinners = data.winners[category] || [];
        console.log(
          `Rendering ${category} section with ${categoryWinners.length} winners`
        );

        return (
          <div key={category} id={category.toLowerCase()}>
            <CategoryReveal
              category={category}
              winners={categoryWinners}
              onComplete={handleNext}
              onPrevious={handlePrevious}
              active={activeSection === category}
            />
          </div>
        );
      })}

      {/* Grand Champion Section */}
      <div id="overall">
        <FinaleReveal
          winners={data.winners.Overall || []}
          onComplete={handleNext}
          onPrevious={handlePrevious}
          active={activeSection === "overall"}
        />
      </div>

      {/* Closing Section */}
      <motion.div
        ref={closingRef}
        className="min-h-[85vh] flex flex-col justify-center items-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: activeSection === "closing" ? 1 : 0.4 }}
        transition={{ duration: 0.5 }}
        id="closing"
        onAnimationComplete={() => {
          if (activeSection === "closing") {
            // Mark reveal as seen when closing section is reached
            markRevealAsSeen();
          }
        }}
      >
        <div className="text-center max-w-2xl">
          <h2 className="text-5xl font-serif font-bold text-amber-200 mb-6">
            Prost! 🍻
          </h2>
          <p className="text-2xl text-amber-100 mb-8">
            The complete leaderboard is now unlocked!
          </p>

          <Link to="/results">
            <motion.button
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-lg shadow-xl text-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Leaderboard
            </motion.button>
          </Link>

          <p className="mt-8 text-amber-200/60 text-sm">
            Results generated at: {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Navigation Controls */}

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

      {/* Accessibility announcement for screen readers */}
      <div className="sr-only" aria-live="assertive">
        {activeSection === "intro" && "Welcome to Brew-Off Results Reveal"}
        {activeSection === "Label" && "Now revealing Best Label category"}
        {activeSection === "Color" && "Now revealing Best Color category"}
        {activeSection === "Drinkability" &&
          "Now revealing Most Drinkable category"}
        {activeSection === "Flavor" && "Now revealing Best Flavor category"}
        {activeSection === "overall" && "Now revealing Grand Champion"}
        {activeSection === "closing" &&
          "Reveal complete. Leaderboard is now unlocked."}
      </div>
    </div>
  );
}
