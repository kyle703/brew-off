// src/components/TestData.tsx
import { useEffect, useState } from "react";
import { loadData } from "../data/fetch";
import type { LoadedData } from "../types";

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

  return (
    <div>
      <h2>Test Data Loaded ✅</h2>
      <h3>First 5 Beers</h3>
      <ul>
        {state.beerList.slice(0, 5).map((b) => (
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
  );
}
