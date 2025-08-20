import { motion } from "framer-motion";

type Props = {
  beerName: string;
  entryId: string;
  brewer?: string;
  className?: string;
};

/**
 * A Bavarian-styled ribbon banner with blue-white diamonds and fork ends
 * Used for beer name display with entry ID on cards
 */
export default function BavarianBanner({
  beerName,
  entryId,
  brewer,
  className = "",
}: Props) {
  return (
    <motion.div
      className={`relative px-4 py-2 overflow-hidden ${className}`}
      initial={{ scaleX: 0.96, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 12 }}
    >
      {/* Banner background with diamond pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600">
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`${
                i % 2 ? "bg-white/40" : "bg-transparent"
              } transform ${
                i >= 8 !== (i % 2 === 0) ? "rotate-45" : "-rotate-45"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Ribbon ends (forks) */}
      <div className="absolute -left-3 top-0 h-full w-6 bg-blue-700 transform rotate-12 origin-top-right" />
      <div className="absolute -right-3 top-0 h-full w-6 bg-blue-700 transform -rotate-12 origin-top-left" />

      {/* Content panel */}
      <div className="relative mx-3 px-4 py-1.5 bg-amber-50 border border-amber-300 rounded-sm">
        <div className="absolute inset-0 border border-yellow-500/30" />
        <div className="text-center">
          <h3 className="font-bold text-xl font-serif text-stone-900 leading-tight">
            {beerName}
            <span className="font-normal text-sm text-stone-500 ml-2">
              [{entryId}]
            </span>
          </h3>
          {brewer && <p className="text-sm text-stone-600 -mt-0.5">{brewer}</p>}
        </div>
      </div>
    </motion.div>
  );
}
