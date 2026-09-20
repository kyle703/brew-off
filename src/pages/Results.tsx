import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResults } from "../api";
import RankSheet from "../components/RankSheet";
import StageBeer from "../components/StageBeer";
import { useSession } from "../context/Session";
import { awardOrder } from "../lib/ceremony";
import type { LoadedData } from "../types";
import { DEFAULT_SCORING_SCHEMA } from "../types";

export default function Results() {
  const { bootstrap } = useSession();
  const [data, setData] = useState<LoadedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return;
    void getResults()
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      );
  }, [bootstrap?.competition.status, data]);

  if (error) {
    return (
      <div className="sheet text-center">
        <h1 className="font-display text-3xl">The ranking is still closed</h1>
        <p className="mt-2 text-muted">{error}</p>
        <Link to="/" className="mt-4 inline-block text-accent">
          Home
        </Link>
      </div>
    );
  }
  if (!data) return <p className="text-muted">Loading the card…</p>;

  const schema =
    bootstrap?.competition.scoringSchema ?? DEFAULT_SCORING_SCHEMA;
  const overall = schema.find((c) => c.id === "overall") ?? schema[schema.length - 1];
  const champion = overall ? data.winners[overall.id]?.[0] : undefined;
  const sections = awardOrder(schema);

  return (
    <div className="space-y-8 pb-10">
      <header className="text-center">
        <p className="kicker">{bootstrap?.competition.tagline}</p>
        <h1 className="font-display text-4xl text-accent sm:text-5xl">
          {bootstrap?.competition.name ?? "Results"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {data.beerList.length} bottles · called{" "}
          {new Date(data.generatedAt).toLocaleString()}
        </p>
      </header>

      {champion && overall && (
        <div className="sheet">
          <p className="kicker text-center">Champion</p>
          <StageBeer
            beer={champion}
            score={champion.scores[overall.id]}
            showNotes
          />
        </div>
      )}

      {sections.map((criterion) => (
        <RankSheet
          key={criterion.id}
          title={criterion.label}
          criterionId={criterion.id}
          beers={data.beerList}
        />
      ))}
    </div>
  );
}
