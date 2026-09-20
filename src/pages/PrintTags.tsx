import { useMemo } from "react";
import BottleQr from "../components/BottleQr";
import { useSession } from "../context/Session";

export default function PrintTags() {
  const { bootstrap } = useSession();
  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );

  if (!bootstrap?.isAdmin) {
    return <p className="text-muted">Admin only.</p>;
  }

  const entries = bootstrap.entries.filter((e) => e.status === "active");

  return (
    <div className="print-tags">
      <div className="mb-4 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl">Bottle tags</h1>
        <button className="btn-primary w-full sm:w-auto" onClick={() => window.print()}>
          Print
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="flex break-inside-avoid flex-col items-center rounded-xl border-2 border-rule bg-paper p-4"
          >
            <p className="kicker">{bootstrap.competition.name}</p>
            <p className="font-display text-6xl text-accent">{entry.entryCode}</p>
            <BottleQr url={`${origin}/t/${entry.entryCode}`} size={140} />
            <p className="mt-2 text-center text-sm text-muted">Scan to score</p>
          </article>
        ))}
      </div>
    </div>
  );
}
