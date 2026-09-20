import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { saveBallot } from "../api";
import LabelImage from "../components/LabelImage";
import ScorePips from "../components/ScorePips";
import { useSession } from "../context/Session";

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

  return (
    <div className="sheet space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="kicker">Bottle</p>
          <h1 className="font-display text-6xl leading-none text-accent">
            {entry.entryCode}
          </h1>
        </div>
        <LabelImage
          src={entry.labelUrl}
          alt={entry.beerName}
          className="h-24 w-24 rounded-lg border border-rule"
        />
      </div>
      <div>
        <h2 className="font-display text-3xl">{entry.beerName}</h2>
        <p className="text-muted">
          {entry.brewer}
          {entry.style ? ` · ${entry.style}` : ""}
          {entry.abv != null ? ` · ${entry.abv}%` : ""}
        </p>
      </div>

      <div className="space-y-5 border-y border-dashed border-rule py-5">
        {schema.map((criterion) => (
          <ScorePips
            key={criterion.id}
            label={criterion.label}
            value={scores[criterion.id] ?? null}
            disabled={locked}
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
