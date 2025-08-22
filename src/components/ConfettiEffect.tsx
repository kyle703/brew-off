import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

type Props = {
  active: boolean;
  duration?: number | null; // null means no timeout
  intensity?: "regular" | "grand";
  onComplete?: () => void;
  showTestButton?: boolean;
};

/**
 * Confetti burst effect component that respects reduced motion preferences
 */
export default function ConfettiEffect({
  active,
  duration = null, // Default to no duration (continuous)
  intensity = "regular",
  onComplete,
  showTestButton = false,
}: Props) {
  const [isActive, setIsActive] = useState(false);
  const [manualTrigger, setManualTrigger] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1000,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Bavarian colors - blue and white
  const bavarianColors = [
    "#0057B7",
    "#FFFFFF",
    "#005CBF",
    "#F0F0FF",
    "#003D7F",
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle confetti activation and deactivation
  useEffect(() => {
    // Don't show confetti if reduced motion is preferred
    if (prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    // Check if confetti should be active (either from props or manual trigger)
    const shouldBeActive = active || manualTrigger;

    // Update active state based on props or manual trigger
    if (shouldBeActive !== isActive) {
      console.log(shouldBeActive ? "Activating" : "Deactivating", "confetti:", {
        active,
        manualTrigger,
        dimensions,
      });
      setIsActive(shouldBeActive);

      // Only set up a timeout if duration is provided (not null)
      if (shouldBeActive && duration !== null) {
        const timer = setTimeout(() => {
          console.log(`Confetti deactivated after ${duration}ms timeout`);
          setIsActive(false);
          setManualTrigger(false); // Reset manual trigger after duration
          if (onComplete) onComplete();
        }, duration);

        return () => clearTimeout(timer);
      } else if (!shouldBeActive && !isActive) {
        // If deactivating, call onComplete
        if (onComplete) onComplete();
      }
    }
  }, [
    active,
    manualTrigger,
    duration,
    isActive,
    onComplete,
    prefersReducedMotion,
    dimensions,
  ]);

  // Manual trigger handler (exposed via showTestButton in callers if needed)
  // Note: manualTrigger can be toggled by parent components via props/state; no local test button here.

  // Configure props based on intensity
  const confettiProps = {
    recycle: true, // Keep generating confetti
    numberOfPieces: intensity === "grand" ? 200 : 100, // Reduced for performance
    gravity: 0.1, // Lighter gravity for slower fall
    initialVelocityY: { min: -15, max: 15 },
    initialVelocityX: { min: -15, max: 15 },
    colors: bavarianColors,
    width: dimensions.width,
    height: dimensions.height,
    tweenDuration: 5000,
    run: true,
  };

  // Debug visibility
  console.log("Render state:", {
    isActive,
    showTestButton,
    prefersReducedMotion,
    dimensions,
    shouldRenderConfetti: isActive && !prefersReducedMotion,
  });

  return (
    <>
      {/* Always render the confetti component when active, but control visibility with CSS */}
      {(isActive || manualTrigger) && !prefersReducedMotion && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <ReactConfetti {...confettiProps} />
        </div>
      )}
    </>
  );
}
