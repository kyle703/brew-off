import { Link } from "react-router-dom";
import LabelImage from "./LabelImage";
import type { Ballot, Entry, ScoringCriterion, TastingDisplay } from "../types";
import { DEFAULT_TASTING_DISPLAY } from "../types";

type Props = {
  entries: Entry[];
  ballots: Ballot[];
  schema: ScoringCriterion[];
  display?: TastingDisplay;
  locked?: boolean;
};

export default function BottleGrid({
  entries,
  ballots,
  schema,
  display = DEFAULT_TASTING_DISPLAY,
  locked,
}: Props) {
  const byCode = new Map(ballots.map((b) => [b.entryCode, b]));
  const sorted = [...entries].sort((a, b) => {
    const da = byCode.has(a.entryCode) ? 1 : 0;
    const db = byCode.has(b.entryCode) ? 1 : 0;
    if (da !== db) return da - db;
    return a.entryCode.localeCompare(b.entryCode, undefined, { numeric: true });
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {sorted.map((entry) => {
        const ballot = byCode.get(entry.entryCode);
        const done = Boolean(ballot);
        const meta = [
          display.style ? entry.style : null,
          display.abv && entry.abv != null ? `${entry.abv}%` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <Link
            key={entry.id}
            to={`/t/${entry.entryCode}`}
            className={`flex h-full min-h-[11.5rem] flex-col rounded-2xl border-2 p-2.5 text-left shadow-sm transition ${
              done
                ? "border-brass bg-accent/10"
                : "border-rule bg-paper hover:border-brass"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-display text-3xl leading-none text-accent">
                {entry.entryCode}
              </span>
              {done ? (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-paper"
                  title={locked ? "Saved" : "Scored"}
                  aria-label={locked ? "Saved" : "Scored"}
                >
                  ✓
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Open
                </span>
              )}
            </div>
            <LabelImage
              src={entry.labelUrl}
              alt=""
              className="mt-2 h-16 w-full rounded-lg border border-rule"
            />
            {display.beerName && entry.beerName ? (
              <p className="mt-2 truncate font-display text-base leading-tight">
                {entry.beerName}
              </p>
            ) : null}
            {display.brewer && entry.brewer ? (
              <p className="truncate text-xs text-muted">{entry.brewer}</p>
            ) : null}
            {meta && <p className="truncate text-xs text-muted">{meta}</p>}
            {ballot && schema.length > 0 ? (
              <dl className="mt-auto grid grid-cols-5 gap-0.5 pt-2">
                {schema.map((criterion) => (
                  <div key={criterion.id} className="text-center">
                    <dt className="truncate text-[9px] uppercase tracking-wide text-muted">
                      {shortLabel(criterion.label)}
                    </dt>
                    <dd className="font-display text-sm leading-none">
                      {ballot.scores[criterion.id] ?? "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-auto pt-2 text-[11px] uppercase tracking-wide text-muted">
                Tap to score
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function shortLabel(label: string): string {
  const parts = label.trim().split(/\s+/);
  if (parts.length === 1) return label.slice(0, 3);
  return parts.map((p) => p[0]).join("").slice(0, 3);
}
