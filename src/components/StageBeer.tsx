import LabelImage from "./LabelImage";
import { fmtScore } from "../lib/format";
import type { ResultBeer } from "../types";

type Props = {
  beer: ResultBeer;
  score?: number;
  showNotes?: boolean;
  punch?: boolean;
};

export default function StageBeer({ beer, score, showNotes, punch }: Props) {
  const notes = showNotes ? beer.comments.slice(0, 3) : [];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 text-center sm:gap-5">
      <p
        className={`font-display leading-none text-accent ${
          punch ? "text-[clamp(4.5rem,22vw,10rem)]" : "text-[clamp(3.2rem,16vw,8rem)]"
        }`}
      >
        {beer.entryCode}
      </p>
      <LabelImage
        src={beer.labelUrl}
        alt={beer.beerName}
        className="h-[min(34vh,18rem)] w-[min(34vh,18rem)] rounded-2xl border-2 border-rule sm:h-[min(42vh,22rem)] sm:w-[min(42vh,22rem)]"
      />
      <div>
        <h2 className="font-display text-4xl sm:text-5xl">{beer.beerName}</h2>
        <p className="mt-1 text-lg text-muted">
          {beer.brewer}
          {beer.style ? ` · ${beer.style}` : ""}
        </p>
      </div>
      {score != null && (
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          {fmtScore(score)} average · {beer.votes}{" "}
          {beer.votes === 1 ? "mark" : "marks"}
        </p>
      )}
      {notes.length > 0 && (
        <ul className="w-full max-w-md space-y-3 border-t border-dashed border-rule pt-4 text-left">
          {notes.map((note) => (
            <li key={note.id}>
              <p className="font-display text-xl leading-snug">“{note.text}”</p>
              {note.author && (
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                  {note.author}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
