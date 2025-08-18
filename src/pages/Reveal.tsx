// swap this with your ResultsReveal component once ready
import { useEffect, useState } from "react";
import { loadData } from "../data/fetch";

export default function Reveal() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    loadData()
      .then(() => setReady(true))
      .catch((e) => setErr(String(e)));
  }, []);

  if (err)
    return <div style={{ color: "tomato" }}>Failed to load data: {err}</div>;
  if (!ready) return <div>Loading…</div>;

  return <div>Reveal deck goes here</div>;
}
