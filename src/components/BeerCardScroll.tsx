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
  const extendedBeers = [...beers];
  const shouldScroll = beers.length >= 5;

  return (
    <div className="py-6">
      {/* Beer Entry Cards - Scroll if 5+ entries, center if fewer */}
      <div className="relative overflow-hidden">
        <div className={`flex ${shouldScroll ? 'animate-scroll-back-and-forth whitespace-nowrap' : 'justify-center flex-wrap'} ${shouldScroll ? '' : 'gap-4'}`}>
          {extendedBeers.map((beer, index) => (
            <div key={`${beer.entryId}-${index}`} className={`${shouldScroll ? 'inline-block mx-4' : ''}`}>
              <EntryOverlayCard
                imageUrl={beer.img || ""}
                name={beer.name}
                entryId={beer.entryId}
                brewer={beer.brewer}
                size="docked"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
