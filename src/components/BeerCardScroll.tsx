import type { Beer } from "../types";
import EntryOverlayCard from "./EntryOverlayCard";

type Props = {
  beers: Beer[];
};

/**
 * Horizontal infinite scrolling display of beer cards
 */
export default function BeerCardScroll({ beers }: Props) {
  // Create a longer list by repeating the beers for seamless loop
  const extendedBeers = [...beers, ...beers, ...beers];

  return (
    <div className="py-8">
      {/* Infinite Horizontal Auto-scroll of Beer Entry Cards */}
      <div className="relative overflow-hidden">
        <div className="flex animate-scroll-back-and-forth whitespace-nowrap">
          {extendedBeers.map((beer, index) => (
            <div key={`${beer.entryId}-${index}`} className="inline-block mx-4">
              <EntryOverlayCard
                imageUrl={beer.img || ""}
                name={beer.name}
                entryId={beer.entryId}
                brewer={beer.brewer}
                size="hero"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
