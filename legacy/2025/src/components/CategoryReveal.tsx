import { useState, useEffect, useRef, useCallback } from "react";
import type { Beer, WinnerCategory } from "../types";
import Podium from "./Podium";
import EntryOverlayCard from "./EntryOverlayCard";
import ConfettiEffect from "./ConfettiEffect";
import CommentBubbles from "./CommentBubbles";
import { generateSampleComments } from "../utils/commentGenerator";

type RevealStep =
  | "header" // Category header shown
  | "podium-enter" // Podium appears
  | "bronze-hero" // Bronze reveal - card hero state
  | "bronze-dock" // Bronze reveal - card docked to podium
  | "silver-hero" // Silver reveal - card hero state
  | "silver-dock" // Silver reveal - card docked to podium
  | "gold-hero" // Gold reveal - card hero state
  | "gold-dock"; // Gold reveal - card docked to podium

const categoryLabel: Record<WinnerCategory, string> = {
  Label: "Best Label",
  Color: "Best Color",
  Drinkability: "Most Drinkable",
  Flavor: "Best Flavor",
  Overall: "Overall",
};

type Props = {
  category: WinnerCategory;
  winners: Beer[];
  onComplete: () => void;
  onPrevious: () => void;
  active: boolean;
};

/**
 * Handles the reveal flow for a single category
 */
export default function CategoryReveal({
  category,
  winners = [],
  onComplete,
  onPrevious,
  active,
}: Props) {
  // Track current step in the reveal process
  const [step, setStep] = useState<RevealStep>("header");
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // References for scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Get entries by position (if they exist)
  const goldEntry = winners[0] || null;
  const silverEntry = winners[1] || null;
  const bronzeEntry = winners[2] || null;

  // Handle preloading of images
  useEffect(() => {
    if (!active || imagesLoaded) return;

    // Create array of image URLs to preload
    const imagesToLoad = winners
      .filter((beer) => beer.img)
      .map((beer) => beer.img as string);

    if (imagesToLoad.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;

    // Preload each image
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
    if (!active || !containerRef.current) return;

    // Scroll to the container when active
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    containerRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    // Debug log
    // console.log(`CategoryReveal ${category} - Current step: ${step}`, {
    //   active,
    //   hasGold: !!goldEntry,
    //   hasSilver: !!silverEntry,
    //   hasBronze: !!bronzeEntry,
    //   imagesLoaded,
    // });
  }, [
    step,
    active,
    category,
    goldEntry,
    silverEntry,
    bronzeEntry,
    imagesLoaded,
  ]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (!imagesLoaded) return;

    switch (step) {
      case "header":
        setStep("podium-enter");
        break;
      case "podium-enter":
        if (bronzeEntry) {
          setStep("bronze-hero");
        } else if (silverEntry) {
          setStep("silver-hero");
        } else if (goldEntry) {
          setStep("gold-hero");
        } else {
          onComplete(); // Skip to next category if no winners
        }
        break;
      case "bronze-hero":
        setStep("bronze-dock");
        break;
      case "bronze-dock":
        if (silverEntry) {
          setStep("silver-hero");
        } else if (goldEntry) {
          setStep("gold-hero");
        } else {
          onComplete(); // Move to next category
        }
        break;
      case "silver-hero":
        setStep("silver-dock");
        break;
      case "silver-dock":
        if (goldEntry) {
          setStep("gold-hero");
        } else {
          onComplete(); // Move to next category
        }
        break;
      case "gold-hero":
        setStep("gold-dock");
        break;
      case "gold-dock":
        onComplete(); // Move to next category
        break;
    }
  }, [step, imagesLoaded, bronzeEntry, silverEntry, goldEntry, onComplete]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    switch (step) {
      case "header":
        onPrevious();
        break;
      case "podium-enter":
        setStep("header");
        break;
      case "bronze-hero":
        setStep("podium-enter");
        break;
      case "bronze-dock":
        setStep("bronze-hero");
        break;
      case "silver-hero":
        if (bronzeEntry) {
          setStep("bronze-dock");
        } else {
          setStep("podium-enter");
        }
        break;
      case "silver-dock":
        setStep("silver-hero");
        break;
      case "gold-hero":
        if (silverEntry) {
          setStep("silver-dock");
        } else if (bronzeEntry) {
          setStep("bronze-dock");
        } else {
          setStep("podium-enter");
        }
        break;
      case "gold-dock":
        setStep("gold-hero");
        break;
    }
  }, [step, bronzeEntry, silverEntry, onPrevious]);

  // Advance on keyboard navigation when active
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

  // Determine card sizes and visibility based on current step
  const getBronzeCardState = () => {
    if (step === "bronze-hero") return { visible: true, size: "hero" };
    if (
      step === "bronze-dock" ||
      step === "silver-hero" ||
      step === "silver-dock" ||
      step === "gold-hero" ||
      step === "gold-dock"
    )
      return { visible: true, size: "mini" }; // Bronze gets mini size on podium
    return { visible: false, size: "mini" };
  };

  const getSilverCardState = () => {
    if (step === "silver-hero") return { visible: true, size: "hero" };
    if (step === "silver-dock" || step === "gold-hero" || step === "gold-dock")
      return { visible: true, size: "mini" }; // Silver gets mini size on podium
    return { visible: false, size: "mini" };
  };

  const getGoldCardState = () => {
    if (step === "gold-hero") return { visible: true, size: "hero" };
    if (step === "gold-dock") return { visible: true, size: "podium" }; // Gold keeps podium size
    return { visible: false, size: "podium" };
  };

  const bronzeState = getBronzeCardState();
  const silverState = getSilverCardState();
  const goldState = getGoldCardState();

  // Custom transform styles for scaling and positioning cards based on rank
  // Accounting for the fact that scaled-down cards need more translation to appear at the right height
  const getCardStyle = (place: 1 | 2 | 3) => {
    switch (place) {
      case 1: // Gold - no scaling (100%), closest to podium
        return {};
      case 2: // Silver - scale down to 85%, medium distance
        // Need to translate more to account for the scaling (60px / 0.85 ≈ 70px)
        return { transform: "scale(0.85) translateY(120px)" };
      case 3: // Bronze - scale down to 70%, furthest from podium
        // Need to translate even more (60px / 0.7 ≈ 85px)
        return { transform: "scale(0.7) translateY(160px)" };
      default:
        return {};
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full py-10 transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-40"
      }`}
    >
      {/* Top-level container with fixed height to prevent layout shifts */}
      <div
        className="w-full max-w-7xl mx-auto px-4 flex flex-col"
        // style={{ minHeight: "1200px" }}
      >
        {/* Category Header - Always at the top */}
        <div ref={headerRef} className="w-full text-center py-4">
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-4 px-8 rounded-xl shadow-lg inline-block">
            <h2 className="text-4xl font-serif font-bold text-amber-200">
              {categoryLabel[category]}
            </h2>
          </div>
        </div>

        {/* Hero Card Area - Middle section */}
        <div
          ref={heroRef}
          className="flex-grow flex justify-center items-center py-8 min-h-[500px] max-h-[65vh] md:max-h-[70vh] relative"
          style={{
            display: step.includes("hero") ? "flex" : "none",
          }}
        >
          {/* Hero Card */}
          <div className="flex justify-center items-center z-10 max-w-full max-h-full relative">
            {/* Bronze Hero */}
            {step === "bronze-hero" && bronzeEntry && (
              <EntryOverlayCard
                imageUrl={bronzeEntry.img || ""}
                name={bronzeEntry.name}
                entryId={bronzeEntry.entryId}
                brewer={bronzeEntry.brewer}
                size="hero"
                scoreBadgeValue={bronzeEntry.scores.overall}
              />
            )}

            {/* Silver Hero */}
            {step === "silver-hero" && silverEntry && (
              <EntryOverlayCard
                imageUrl={silverEntry.img || ""}
                name={silverEntry.name}
                entryId={silverEntry.entryId}
                brewer={silverEntry.brewer}
                size="hero"
                scoreBadgeValue={silverEntry.scores.overall}
              />
            )}

            {/* Gold Hero */}
            {step === "gold-hero" && goldEntry && (
              <EntryOverlayCard
                imageUrl={goldEntry.img || ""}
                name={goldEntry.name}
                entryId={goldEntry.entryId}
                brewer={goldEntry.brewer}
                size="hero"
                scoreBadgeValue={goldEntry.scores.overall}
              />
            )}
          </div>

          {/* Full-width Comments Overlay */}
          {step.includes("hero") && (
            <div className="absolute inset-0 z-20">
              <CommentBubbles
                key={`${step}-${
                  step === "bronze-hero"
                    ? bronzeEntry?.entryId
                    : step === "silver-hero"
                    ? silverEntry?.entryId
                    : goldEntry?.entryId
                }`}
                comments={
                  step === "bronze-hero" && bronzeEntry
                    ? (bronzeEntry.comments && bronzeEntry.comments.length > 0
                        ? bronzeEntry.comments
                        : generateSampleComments(bronzeEntry))
                    : step === "silver-hero" && silverEntry
                    ? (silverEntry.comments && silverEntry.comments.length > 0
                        ? silverEntry.comments
                        : generateSampleComments(silverEntry))
                    : step === "gold-hero" && goldEntry
                    ? (goldEntry.comments && goldEntry.comments.length > 0
                        ? goldEntry.comments
                        : generateSampleComments(goldEntry))
                    : []
                }
                active={true}
                maxBubbles={3}
                displayDuration={12000}
                spacerDuration={1000}
              />
            </div>
          )}
        </div>

        {/* Podium Area with Cards - Bottom section */}
        <div
          className="mt-auto"
          style={{
            display:
              step !== "header" && !step.includes("hero") ? "block" : "none",
          }}
        >
          {/* Cards positioned above podium - reduced horizontal spacing */}
          <div className="flex justify-center items-end mb-0">
            {/* Silver Card */}
            <div className="flex-1 flex justify-end">
              {silverEntry &&
                silverState.visible &&
                silverState.size === "mini" && (
                  <div style={getCardStyle(2)}>
                    <EntryOverlayCard
                      imageUrl={silverEntry.img || ""}
                      name={silverEntry.name}
                      entryId={silverEntry.entryId}
                      brewer={silverEntry.brewer}
                      size="docked"
                      scoreBadgeValue={silverEntry.scores.overall}
                    />
                  </div>
                )}
            </div>

            {/* Gold Card */}
            <div className="flex-1 flex justify-center">
              {goldEntry &&
                goldState.visible &&
                goldState.size === "podium" && (
                  <div style={getCardStyle(1)}>
                    <EntryOverlayCard
                      imageUrl={goldEntry.img || ""}
                      name={goldEntry.name}
                      entryId={goldEntry.entryId}
                      brewer={goldEntry.brewer}
                      size="docked"
                      scoreBadgeValue={goldEntry.scores.overall}
                    />
                  </div>
                )}
            </div>

            {/* Bronze Card */}
            <div className="flex-1 flex justify-start">
              {bronzeEntry &&
                bronzeState.visible &&
                bronzeState.size === "mini" && (
                  <div style={getCardStyle(3)}>
                    <EntryOverlayCard
                      imageUrl={bronzeEntry.img || ""}
                      name={bronzeEntry.name}
                      entryId={bronzeEntry.entryId}
                      brewer={bronzeEntry.brewer}
                      size="docked"
                      scoreBadgeValue={bronzeEntry.scores.overall}
                    />
                  </div>
                )}
            </div>
          </div>

          {/* Actual Podium */}
          <Podium winners={[]} />
        </div>
      </div>

      {/* Add confetti test button for debugging */}
      <ConfettiEffect active={false} duration={3000} />

      {/* Loading indicator */}
      {active && !imagesLoaded && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-slate-800 rounded-lg px-8 py-4 shadow-lg">
            <p className="text-white text-xl">Loading assets...</p>
          </div>
        </div>
      )}

      {/* Navigation Controls (only visible when active) */}
      {active && (
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
