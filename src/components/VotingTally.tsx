import LabelImage from "./LabelImage";
import { fmtScore } from "../lib/format";
import type { AdminStats, ScoringCriterion } from "../types";

type Props = {
  stats: AdminStats;
  schema: ScoringCriterion[];
  live: boolean;
};

export default function VotingTally({ stats, schema, live }: Props) {
  const headline =
    schema.find((criterion) => criterion.id === "overall") ?? schema[0];
  const rest = schema.filter((criterion) => criterion.id !== headline?.id);
  const ranked = stats.entries.filter((entry) => entry.ballotCount > 0);
  const open = stats.entries.filter((entry) => entry.ballotCount === 0);

  return (
    <section className="sheet space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker flex items-center gap-2">
            {live && (
              <span
                className="inline-block h-2 w-2 rounded-full bg-accent motion-safe:animate-pulse"
                aria-hidden
              />
            )}
            {live ? "Live" : "Closed"}
          </p>
          <h2 className="font-display text-2xl">Voting tally</h2>
          <p className="text-sm text-muted">
            {live
              ? "Updates as phones save. This stays on the host desk."
              : "Voting is closed."}
          </p>
        </div>
        <p className="shrink-0 text-right text-sm tabular-nums text-muted">
          <span className="block">
            {stats.tasters} {stats.tasters === 1 ? "taster" : "tasters"}
          </span>
          <span className="block">
            {stats.ballots} {stats.ballots === 1 ? "ballot" : "ballots"}
          </span>
        </p>
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-muted">
          No scores yet. They show up here as phones save a bottle.
        </p>
      ) : (
        <ol className="space-y-3">
          {ranked.map((entry, index) => (
            <li
              key={entry.id}
              className={`border-b border-dashed border-rule pb-3 last:border-0 ${
                index === 0 ? "-mx-2 rounded-xl bg-accent/10 px-2 pt-2" : ""
              }`}
            >
              <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 sm:grid-cols-[2.5rem_1fr_auto] sm:gap-3">
                <span className="font-display text-lg text-muted sm:text-2xl">
                  {index + 1}
                </span>
                <span className="flex min-w-0 items-center gap-3">
                  <LabelImage
                    src={entry.labelUrl}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-md border border-rule sm:h-12 sm:w-12"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg sm:text-xl">
                      <span className="mr-2 text-accent">{entry.entryCode}</span>
                      {entry.beerName}
                    </span>
                    <span className="block truncate text-sm text-muted">
                      {entry.brewer}
                      {entry.status === "hidden" ? " · hidden" : ""}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-display text-xl tabular-nums sm:text-2xl">
                    {fmtScore(headline ? entry.scores[headline.id] : undefined)}
                  </span>
                  <span className="block text-xs text-muted">
                    {headline?.label ?? "Score"}
                  </span>
                </span>
              </div>
              {rest.length > 0 && (
                <dl className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pl-10 sm:pl-12">
                  {rest.map((criterion) => (
                    <div key={criterion.id} className="text-xs">
                      <dt className="inline uppercase tracking-wide text-muted">
                        {shortLabel(criterion.label)}
                      </dt>{" "}
                      <dd className="inline font-display text-sm tabular-nums text-ink">
                        {fmtScore(entry.scores[criterion.id])}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="mt-2 pl-10 sm:pl-12">
                <div className="h-1.5 overflow-hidden rounded-full bg-rule/40">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${coverage(entry.ballotCount, stats.tasters)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs tabular-nums text-muted">
                  {entry.ballotCount} of {stats.tasters} scored
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {open.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted">
            No scores yet
          </p>
          <div className="flex flex-wrap gap-2">
            {open.map((entry) => (
              <span
                key={entry.id}
                className="rounded-lg border border-dashed border-rule px-2 py-1 font-display text-lg text-muted"
              >
                {entry.entryCode}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function coverage(ballots: number, tasters: number): number {
  if (tasters <= 0) return 0;
  return Math.max(0, Math.min(100, (ballots / tasters) * 100));
}

function shortLabel(label: string): string {
  const parts = label.trim().split(/\s+/);
  if (parts.length === 1) return label.slice(0, 3);
  return parts.map((part) => part[0]).join("").slice(0, 3);
}
