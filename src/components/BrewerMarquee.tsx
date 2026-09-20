import { useEffect, useState } from "react";
import LabelImage from "./LabelImage";
import type { Entry } from "../types";

type Props = {
  entries: Entry[];
};

export default function BrewerMarquee({ entries }: Props) {
  const active = entries.filter((e) => e.status === "active");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (active.length === 0) return null;

  const loop = [...active, ...active];
  if (active.length === 1) loop.push(...active, ...active);

  return (
    <>
      <div className="md:hidden">
        {reduced ? (
          <div className="full-bleed flex gap-3 overflow-x-auto px-4 py-3">
            {active.map((entry) => (
              <MarqueeCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="full-bleed overflow-hidden py-3" aria-hidden>
            <div
              className="marquee-track flex w-max gap-4"
              style={{ animationDuration: `${Math.max(18, active.length * 4)}s` }}
            >
              {loop.map((entry, i) => (
                <MarqueeCard key={`${entry.id}-${i}`} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:grid grid-cols-[repeat(auto-fit,minmax(13rem,16rem))] justify-evenly gap-4">
        {active.map((entry) => (
          <DetailCard key={entry.id} entry={entry} />
        ))}
      </div>
    </>
  );
}

function MarqueeCard({ entry }: { entry: Entry }) {
  return (
    <article className="flex w-44 shrink-0 items-center gap-3 rounded-2xl border-2 border-rule bg-sheet p-2">
      <LabelImage
        src={entry.labelUrl}
        alt=""
        className="h-16 w-16 rounded-lg border border-rule"
      />
      <div className="min-w-0">
        <p className="font-display text-lg leading-none text-accent">{entry.entryCode}</p>
        <p className="truncate font-display text-base leading-tight">{entry.beerName}</p>
        <p className="truncate text-xs text-muted">{entry.brewer}</p>
      </div>
    </article>
  );
}

function DetailCard({ entry }: { entry: Entry }) {
  const meta = [entry.style, entry.abv != null ? `${entry.abv}%` : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="flex h-full flex-col rounded-2xl border-2 border-rule bg-sheet p-3 text-left shadow-sm">
      <span className="font-display text-3xl leading-none text-accent">
        {entry.entryCode}
      </span>
      <LabelImage
        src={entry.labelUrl}
        alt=""
        className="mt-2 h-28 w-full rounded-lg border border-rule"
      />
      <p className="mt-2 font-display text-lg leading-tight">{entry.beerName}</p>
      <p className="text-sm text-muted">{entry.brewer}</p>
      {meta && <p className="text-xs text-muted">{meta}</p>}
    </article>
  );
}
