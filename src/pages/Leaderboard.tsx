import { useEffect, useState } from "react";
import { loadData } from "../data/fetch";
import type { Beer } from "../types";

export default function Leaderboard() {
  const [rows, setRows] = useState<Beer[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    loadData()
      .then((d) => setRows(d.beerList))
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <div style={{ color: "tomato" }}>Error: {err}</div>;
  if (!rows.length) return <div>Loading…</div>;

  return (
    <div>
      <h1>Leaderboard</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Entry</th>
            <th align="left">Beer</th>
            <th>Drinkability</th>
            <th>Flavor</th>
            <th>Color</th>
            <th>Label</th>
            <th>Overall</th>
            <th>Votes</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.entryId}>
              <td>{b.entryId}</td>
              <td>
                {b.name} {b.brewer ? `— ${b.brewer}` : ""}
              </td>
              <td align="center">{fmt(b.scores.drinkability)}</td>
              <td align="center">{fmt(b.scores.flavor)}</td>
              <td align="center">{fmt(b.scores.color)}</td>
              <td align="center">{fmt(b.scores.label)}</td>
              <td align="center">
                <b>{fmt(b.scores.overall)}</b>
              </td>
              <td align="center">{b.scores.votes}</td>
              <td align="center">{fmt(b.scores.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function fmt(n: number) {
  return Number.isFinite(n) ? (Math.round(n * 100) / 100).toFixed(2) : "";
}
