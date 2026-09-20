// src/components/TestData.tsx
import { useEffect, useState } from "react";
import { loadData } from "../data/fetch";
import type { LoadedData } from "../types";
import EntryOverlayCard from "./EntryOverlayCard";
import BavarianPlacard from "./BavarianPlacard";

export default function TestData() {
  const [state, setState] = useState<LoadedData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    loadData()
      .then((d) => setState(d))
      .catch((e) => setErr(e.message || String(e)));
  }, []);

  if (err) return <div style={{ color: "red" }}>Error: {err}</div>;
  if (!state) return <div>Loading…</div>;

  // Get first beer for testing
  const testBeer = state.beerList[0];

  return (
    <div className="p-6 space-y-8">
      <h2>Test Data Loaded ✅</h2>

      {/* Bavarian Placard Test */}
      <div className="space-y-6">
        <h3>Bavarian Placard Test</h3>
        <div className="w-full max-w-4xl mx-auto">
          <BavarianPlacard />
        </div>
      </div>

      {/* Test EntryOverlayCard */}
      <div className="space-y-6">
        <h3>EntryOverlayCard Test</h3>
        {testBeer && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Hero Size</h4>
            <EntryOverlayCard
              imageUrl={testBeer.img || ""}
              name={testBeer.name}
              entryId={testBeer.entryId}
              brewer={testBeer.brewer}
              size="hero"
            />

            <h4 className="text-lg font-semibold">Docked Size</h4>
            <EntryOverlayCard
              imageUrl={testBeer.img || ""}
              name={testBeer.name}
              entryId={testBeer.entryId}
              brewer={testBeer.brewer}
              size="docked"
            />
          </div>
        )}

        <h3>First 5 Beers</h3>
        <ul>
          {state.beerList.map((b) => (
            <li key={b.entryId}>
              {b.entryId} — {b.name} ({b.brewer})
            </li>
          ))}
        </ul>
        <h3>Overall Winner</h3>
        <p>
          {state.winners.Overall?.[0]?.name} by{" "}
          {state.winners.Overall?.[0]?.brewer}
        </p>
      </div>
    </div>
  );
}
