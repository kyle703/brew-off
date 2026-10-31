import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { saveBallot } from "../api";
import LabelArt from "../components/LabelArt";
import ScorePips from "../components/ScorePips";
import { useSession } from "../context/Session";
import { DEFAULT_TASTING_DISPLAY } from "../types";

export default function Scorecard() {
  const { code } = useParams();
  const { bootstrap, refresh } = useSession();
  const entry = bootstrap?.entries.find((e) => e.entryCode === code);
  const existing = bootstrap?.ballots.find((b) => b.entryCode === code);
  const schema = useMemo(
    () => bootstrap?.competition.scoringSchema ?? [],
    [bootstrap],
  );
  const locked = !bootstrap?.competition.tastingOpen;

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [artOpen, setArtOpen] = useState(false);

  useEffect(() => {
    if (existing) {
      setScores(existing.scores);
      setComment(existing.comment ?? "");
    }
  }, [existing]);

  const complete = useMemo(
    () => schema.every((c) => scores[c.id] >= 1 && scores[c.id] <= 5),
    [schema, scores],
  );

  if (!bootstrap) return null;
  if (!entry) {
    return (
      <div className="sheet text-center">
        <h1 className="font-display text-3xl">Unknown bottle</h1>
        <Link to="/" className="text-accent">
          Back to the grid
        </Link>
      </div>
    );
  }

  const display =
    bootstrap.competition.tastingDisplay ?? DEFAULT_TASTING_DISPLAY;
  const meta = [
    display.brewer ? entry.brewer : null,
    display.style ? entry.style : null,
    display.abv && entry.abv != null ? `${entry.abv}%` : null,
  ].filter(Boolean);

  async function onSave() {
    if (!code) return;
    setBusy(true);
    setError(null);
    try {
      await saveBallot(code, scores, comment);
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const artLabel = [entry.entryCode, entry.beerName].filter(Boolean).join(" · ");
  const identity = (
    <div className="min-w-0">
      <p className="kicker">Bottle</p>
      <h1
        className={`font-display leading-none text-accent ${
          entry.labelUrl ? "text-5xl" : "text-6xl"
        }`}
      >
        {entry.entryCode}
      </h1>
      {display.beerName && entry.beerName ? (
        <h2 className="mt-2 break-words font-display text-2xl leading-tight sm:text-3xl">
          {entry.beerName}
        </h2>
      ) : null}
      {meta.length > 0 ? (
        <p className="mt-1 text-sm text-muted">{meta.join(" · ")}</p>
      ) : null}
    </div>
  );

  return (
    <div className="sheet space-y-5">
      {entry.labelUrl ? (
        <div className="-mx-4 -mt-4 flex items-center gap-3 rounded-t-[14px] border-b border-rule bg-[color-mix(in_srgb,black_28%,var(--paper))] px-3 py-3 sm:-mx-5 sm:-mt-5 sm:gap-5 sm:px-5 sm:py-4">
          <LabelArt
            src={entry.labelUrl}
            alt={artLabel}
            open={artOpen}
            onOpenChange={setArtOpen}
            className="w-1/2 max-w-60 shrink-0"
          />
          {identity}
        </div>
      ) : (
        identity
      )}

      <div className="space-y-5 border-y border-dashed border-rule py-5">
        {schema.map((criterion) => (
          <ScorePips
            key={criterion.id}
            label={criterion.label}
            value={scores[criterion.id] ?? null}
            disabled={locked}
            extra={
              entry.labelUrl &&
              (criterion.id === "label" ||
                criterion.label.toLowerCase() === "label") ? (
                <button
                  type="button"
                  className="min-h-11 shrink-0 px-1 text-xs font-semibold uppercase tracking-wide text-accent"
                  onClick={() => setArtOpen(true)}
                >
                  See label
                </button>
              ) : undefined
            }
            onChange={(n) => {
              setSaved(false);
              setScores((s) => ({ ...s, [criterion.id]: n }));
            }}
          />
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
          One-line note
        </span>
        <input
          className="field"
          disabled={locked}
          value={comment}
          maxLength={160}
          placeholder="Optional"
          onChange={(e) => {
            setSaved(false);
            setComment(e.target.value);
          }}
        />
      </label>

      {error && <p className="text-sm text-red-800">{error}</p>}

      {!locked && (
        <div className="sticky bottom-2 z-10 bg-gradient-to-t from-sheet via-sheet to-transparent pt-3">
          <button
            type="button"
            className="btn-primary w-full"
            disabled={!complete || busy}
            onClick={() => void onSave()}
          >
            {busy ? "Saving…" : existing || saved ? "Update" : "Save"}
          </button>
        </div>
      )}
      {saved && <p className="text-center text-sm text-accent">Saved on this phone.</p>}

      <Link to="/" className="block text-center text-accent">
        Back to the grid
      </Link>
    </div>
  );
}
