import { motion, useReducedMotion } from "framer-motion";
import DriveImage from "./DriveImage";

type CardSize = "hero" | "docked";

const GOLD_ACCENT = "#E3B341";
const PARCHMENT = "#F3E9D2";

type Props = {
  imageUrl: string;
  name: string;
  entryId: string | number;
  brewer?: string;
  abv?: number;
  size?: CardSize;
  /** Path to the decorative overlay PNG (in public/ by default) */
  overlaySrc?: string;
  className?: string;
  onLoad?: () => void;
  /** CSS width for the frame. Defaults from `size`. */
  width?: string;
  /** Optional overall score badge shown as a cohesive block in the top-right */
  scoreBadgeValue?: number;
};

/**
 * Overlay-based entry card that layers a single PNG frame over a user image
 * and renders banner text within a safe area. Features a stylized brewer tag.
 * Follows the spec in `Card_Redesign.md`.
 */
export default function EntryOverlayCard({
  imageUrl,
  name,
  entryId,
  brewer,
  abv,
  size = "docked",
  overlaySrc = `${import.meta.env.BASE_URL}beer_entry_overlay.png`,
  className = "",
  onLoad,
  width,
  scoreBadgeValue,
}: Props) {
  const prefersReducedMotion = useReducedMotion();

  const containerWidth =
    width ?? (size === "hero" ? "min(30vw, 420px)" : "min(280px, 70vw)");

  // Banner safe-area as a percentage of the overlay, back to original positioning
  // width ~76%, height ~11%, centered horizontally, positioned for original overlay
  const bannerWidthPct = 76;
  const bannerHeightPct = 11;
  const bannerCenterYPct = 67; // Back to original positioning
  const bannerLeftPct = (100 - bannerWidthPct) / 2;
  const bannerTopPct = bannerCenterYPct - bannerHeightPct / 2; // center vertically at 66%

  const card = (
    <motion.div
      className="relative w-full"
      style={{
        aspectRatio: "1 / 1",
        borderRadius: 16,
        containerType: "inline-size",
      }}
      {...(prefersReducedMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
        : {
            initial: { scale: 0.92, y: 24, opacity: 0 },
            animate: {
              scale: 1,
              y: 0,
              opacity: 1,
              transition: {
                type: "spring" as const,
                stiffness: 120,
                damping: 20,
                mass: 1,
              },
            },
          })}
    >
      {/* Optional score badge (top-right, above the overlay) */}
      {typeof scoreBadgeValue === "number" && (
        <div
          className="absolute z-20"
          style={{
            top: size === "hero" ? "3%" : "3.5%",
            right: size === "hero" ? "15%" : "4%",
          }}
        >
          <div
            className="flex items-center justify-center rounded-[12px] font-bold shadow-md"
            style={{
              height: "clamp(28px, 16cqi, 48px)",
              width: "clamp(52px, 32cqi, 84px)",
              background: PARCHMENT,
              border: "3px solid #E3B341",
              color: "#0E1623",
              fontSize: "clamp(13px, 11cqi, 22px)",
            }}
          >
            <span>{scoreBadgeValue.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Overlay PNG with transparent cutout - reveals image underneath */}
      <img
        src={overlaySrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-10"
        draggable={false}
      />

      {/* Container that matches the overlay's transparent window exactly */}
      <div
        className="absolute"
        style={{
          // Position to match overlay's transparent window dimensions
          top: "10%",
          left: "20%",
          right: "20%",
          bottom: "35%",
          borderRadius: 64,
          overflow: "hidden",
        }}
      >
        {/* User image fills the container exactly */}
        {imageUrl ? (
          <DriveImage
            driveIdOrUrl={imageUrl}
            alt={`${name} [${entryId}]`}
            className="w-full h-full object-cover"
            onLoad={() => onLoad?.()}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
            <SteinIcon className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Banner text layer inside safe area - adjusted for scaled overlay */}
      <div
        className="absolute left-0 top-0 z-20 flex flex-col items-center justify-center overflow-hidden px-2 text-center"
        style={{
          left: `${bannerLeftPct}%`,
          top: `${bannerTopPct}%`,
          width: `${bannerWidthPct}%`,
          height: `${bannerHeightPct}%`,
        }}
      >
        <div
          className="w-full truncate leading-none"
          title={name}
          style={{
            color: "#171922",
            fontSize: "clamp(12px, 8cqi, 26px)",
            fontWeight: "bold",
          }}
        >
          <span className="font-fraktur tracking-tight">{name}</span>
        </div>
      </div>

      {/* Stylized Brewer Tag - adjusted for scaled overlay */}
      {brewer && (
        <div
          className="absolute left-0 top-0 flex items-center justify-center z-20"
          style={{
            left: "8%",
            top: "88%",
            width: "84%",
            height: "8%",
          }}
        >
          <div
            className="px-4 py-2 rounded-full flex items-center gap-2"
            style={{
              backgroundColor: "rgba(25,34,53,0.95)",
              color: "#E9ECF5",
              border: "2px solid #E3B341",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <WheatIcon className="w-4 h-4 text-amber-400" />
            <span
              className="font-fraktur tracking-wide"
              style={{ fontSize: "clamp(11px, 7cqi, 18px)" }}
            >
              {brewer}
            </span>
            {abv && (
              <>
                <span className="text-amber-400 mx-1">•</span>
                <span className="text-amber-400 font-mono text-xs">
                  {abv}% ABV
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className={className} style={{ width: containerWidth }}>
      {card}
    </div>
  );
}

// ---------- Internal UI bits ----------

function SteinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 4h7a3 3 0 0 1 3 3v1h1a3 3 0 0 1 3 3v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V7a3 3 0 0 1 3-3zm10 6V8h1a1 1 0 0 1 1 1v3h-2z" />
    </svg>
  );
}

function WheatIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2c1.1 1.6 1.6 3.3 1.6 5.2 0 1.9-.5 3.6-1.6 5.2-1.1-1.6-1.6-3.3-1.6-5.2C10.4 5.3 10.9 3.6 12 2zm0 7c1.1 1.6 1.6 3.3 1.6 5.2 0 1.9-.5 3.6-1.6 5.2-1.1-1.6-1.6-3.3-1.6-5.2 0-1.9.5-3.6 1.6-5.2zM6 8c1 1.2 1.5 2.6 1.5 4S7 14.8 6 16c-1-1.2-1.5-2.6-1.5-4S5 9.2 6 8zm12 0c1 1.2 1.5 2.6 1.5 4s-.5 2.8-1.5 4c-1-1.2-1.5-2.6-1.5-4s.5-2.8 1.5-4z" />
    </svg>
  );
}
