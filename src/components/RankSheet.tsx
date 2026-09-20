import { useMemo, useState } from "react";
import LabelImage from "./LabelImage";
import { fmtScore } from "../lib/format";
import type { ResultBeer } from "../types";

type Props = {
  title: string;
  criterionId: string;
  beers: ResultBeer[];
};

export default function RankSheet({ title, criterionId, beers }: Props) {
  const ranked = useMemo(() => {
    return [...beers].sort(
      (a, b) =>
        (b.scores[criterionId] ?? 0) - (a.scores[criterionId] ?? 0) ||
        b.votes - a.votes ||
        a.entryCode.localeCompare(b.entryCode),
    );
  }, [beers, criterionId]);

  return (
    <section className="sheet space-y-4">
      <h2 className="font-display text-3xl text-accent">{title}</h2>
      <ol className="space-y-3">
        {ranked.map((beer, i) => (
          <RankRow
            key={beer.entryCode}
            place={i + 1}
            beer={beer}
            score={beer.scores[criterionId]}
          />
        ))}
      </ol>
    </section>
  );
}

function RankRow({
  place,
  beer,
  score,
}: {
  place: number;
  beer: ResultBeer;
  score: number | undefined;
}) {
  const [open, setOpen] = useState(false);
  const hasNotes = beer.comments.length > 0;
  const inner = (
      <>
        <span className="font-display text-lg text-muted sm:text-2xl">{place}</span>
        <span className="flex min-w-0 items-center gap-3">
          <LabelImage
            src={beer.labelUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-md border border-rule sm:h-12 sm:w-12"
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg sm:text-xl">
              <span className="mr-2 text-accent">{beer.entryCode}</span>
              {beer.beerName}
            </span>
            <span className="block truncate text-sm text-muted">{beer.brewer}</span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display text-xl sm:text-2xl">{fmtScore(score)}</span>
          <span className="block text-xs text-muted">{beer.votes}</span>
        </span>
      </>
  );

  return (
    <li className="border-b border-dashed border-rule pb-3 last:border-0">
      {hasNotes ? (
        <button
          type="button"
          className="grid w-full grid-cols-[2rem_1fr_auto] items-center gap-2 text-left sm:grid-cols-[2.5rem_1fr_auto] sm:gap-3"
          onClick={() => setOpen((v) => !v)}
        >
          {inner}
        </button>
      ) : (
        <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 sm:grid-cols-[2.5rem_1fr_auto] sm:gap-3">
          {inner}
        </div>
      )}
      {open && (
        <ul className="mt-2 space-y-2 pl-12 text-sm">
          {beer.comments.map((note) => (
            <li key={note.id}>
              <span className="text-ink">“{note.text}”</span>
              {note.author && (
                <span className="text-muted"> — {note.author}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
