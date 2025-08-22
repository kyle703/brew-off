import { useEffect, useMemo, useState } from "react";
import type { Beer } from "../types";
import EntryOverlayCard from "./EntryOverlayCard";

type Props = {
  beers: Beer[];
  className?: string;
};

function getTargetColumns(viewportWidth: number): number {
  if (viewportWidth < 640) return 2; // sm
  if (viewportWidth < 1024) return 3; // md/lg
  return 4; // xl+
}

function computeBalancedRows<T>(items: T[], numRows: number): T[][] {
  if (numRows <= 1) return [items];
  const total = items.length;
  const basePerRow = Math.floor(total / numRows);
  const remainder = total % numRows;

  const result: T[][] = [];
  let index = 0;
  for (let r = 0; r < numRows; r++) {
    const count = basePerRow + (r < remainder ? 1 : 0);
    result.push(items.slice(index, index + count));
    index += count;
  }
  return result;
}

export default function EntryGrid({ beers, className = "" }: Props) {
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const rows = useMemo(() => {
    if (beers.length === 0) return [] as Beer[][];
    const targetColumns = getTargetColumns(viewportWidth);
    const desiredRows = Math.max(1, Math.ceil(beers.length / targetColumns));
    return computeBalancedRows(beers, desiredRows);
  }, [beers, viewportWidth]);

  return (
    <div className={`w-full mx-auto ${className}`}>
      <div className="flex flex-col gap-6">
        {rows.map((row, idx) => (
          <div key={idx} className="flex flex-wrap justify-center gap-4">
            {row.map((beer) => (
              <div key={beer.entryId} className="">
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
        ))}
      </div>
    </div>
  );
} 