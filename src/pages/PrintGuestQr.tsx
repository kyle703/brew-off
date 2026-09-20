import { useMemo } from "react";
import BottleQr from "../components/BottleQr";
import { useSession } from "../context/Session";

const SIGNS = [
  { path: "/register", label: "Register a beer", hint: "Scan to enter a bottle" },
  { path: "/", label: "Score bottles", hint: "Scan to vote" },
] as const;

export default function PrintGuestQr() {
  const { bootstrap } = useSession();
  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );

  if (!bootstrap?.isAdmin) {
    return <p className="text-muted">Admin only.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Guest QR signs</h1>
          <p className="text-sm text-muted">
            Print these, or use Save as PDF from the print dialog.
          </p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => window.print()}>
          Print
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {SIGNS.map((sign) => {
          const dest = sign.path === "/" ? "" : sign.path;
          const url = `${origin}${dest}`;
          return (
            <article
              key={sign.path}
              className="flex break-inside-avoid flex-col items-center rounded-xl border-2 border-rule bg-paper p-6 text-center"
            >
              <p className="kicker">{bootstrap.competition.name}</p>
              <h2 className="mt-1 font-display text-3xl text-accent">{sign.label}</h2>
              <p className="mt-1 text-sm text-muted">{sign.hint}</p>
              <div className="my-5">
                <BottleQr url={url} size={280} />
              </div>
              <p className="break-all text-xs text-muted">{url}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
