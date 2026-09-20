import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminLogin,
  adminLogout,
  createEntry,
  getAdminStats,
  patchCompetition,
  patchEntry,
} from "../api";
import EntryForm from "../components/EntryForm";
import { useSession } from "../context/Session";
import type { AdminStats, CompetitionStatus, Entry } from "../types";

const STATUSES: { id: CompetitionStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "registration", label: "Open registration" },
  { id: "tasting", label: "Open tasting" },
  { id: "closed", label: "Close voting" },
  { id: "reveal", label: "Start reveal" },
  { id: "published", label: "Publish results" },
];

export default function Admin() {
  const { bootstrap, loading, refresh } = useSession();
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [themeId, setThemeId] = useState("baseline");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!bootstrap?.isAdmin) return;
    setName(bootstrap.competition.name);
    setTagline(bootstrap.competition.tagline ?? "");
    setThemeId(bootstrap.competition.themeId);
    void getAdminStats().then(setStats).catch(() => setStats(null));
  }, [bootstrap]);

  if (loading) return <p className="text-muted">Loading…</p>;

  if (!bootstrap?.isAdmin) {
    return (
      <form
        className="sheet mx-auto max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setLoginError(null);
          void adminLogin(password)
            .then(() => refresh())
            .catch((err: unknown) =>
              setLoginError(err instanceof Error ? err.message : String(err)),
            )
            .finally(() => setBusy(false));
        }}
      >
        <h1 className="font-display text-3xl">Host desk</h1>
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {loginError && <p className="text-sm text-red-800">{loginError}</p>}
        <button className="btn-primary w-full" disabled={busy} type="submit">
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    );
  }

  const competition = bootstrap.competition;

  async function setStatus(status: CompetitionStatus) {
    setBusy(true);
    try {
      await patchCompetition({ status });
      await refresh();
      setStats(await getAdminStats());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="kicker">Host desk</p>
          <h1 className="font-display text-3xl sm:text-4xl">{competition.name}</h1>
          <p className="text-muted">Status: {competition.status}</p>
        </div>
        <button
          className="btn-secondary min-h-12 w-full sm:w-auto"
          onClick={() => void adminLogout().then(() => refresh())}
        >
          Log out
        </button>
      </div>

      <section className="sheet space-y-3">
        <h2 className="font-display text-2xl">Show control</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              className={`min-h-12 w-full ${
                competition.status === s.id ? "btn-primary" : "btn-secondary"
              }`}
              disabled={busy}
              onClick={() => void setStatus(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="flex min-h-12 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={competition.registrationOpen}
            onChange={(e) =>
              void patchCompetition({ registrationOpen: e.target.checked }).then(
                () => refresh(),
              )
            }
          />
          Registration open
        </label>
        <label className="flex min-h-12 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={competition.tastingOpen}
            onChange={(e) =>
              void patchCompetition({ tastingOpen: e.target.checked }).then(() =>
                refresh(),
              )
            }
          />
          Tasting open
        </label>
        <label className="flex min-h-12 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={competition.entriesFrozen}
            onChange={(e) =>
              void patchCompetition({ entriesFrozen: e.target.checked }).then(
                () => refresh(),
              )
            }
          />
          Freeze new entries
        </label>
      </section>

      <section className="sheet space-y-3">
        <h2 className="font-display text-2xl">Instance</h2>
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="field"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Tagline"
        />
        <select
          className="field"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
        >
          <option value="baseline">Baseline template</option>
          <option value="2026">2026 vintage</option>
        </select>
        <button
          className="btn-secondary w-full sm:w-auto"
          onClick={() =>
            void patchCompetition({
              name,
              tagline,
              themeId,
            }).then(() => refresh())
          }
        >
          Save instance
        </button>
      </section>

      {stats && (
        <section className="sheet space-y-2">
          <h2 className="font-display text-2xl">Live counts</h2>
          <p>
            {stats.tasters} tasters · {stats.ballots} ballots
          </p>
          <ul className="space-y-1 text-sm">
            {stats.entries.map((e) => (
              <li key={e.id} className="flex justify-between gap-3">
                <span>
                  {e.entryCode} {e.beerName}
                </span>
                <span className="text-muted">{e.ballotCount} scores</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Bottles</h2>
          <Link to="/admin/tags" className="text-accent">
            Print tags
          </Link>
        </div>
        {bootstrap.entries.map((entry) => (
          <AdminEntry
            key={entry.id}
            entry={entry}
            onSaved={async () => {
              await refresh();
              setStats(await getAdminStats());
            }}
          />
        ))}
        <div>
          <h3 className="mb-2 font-display text-xl">Add a bottle</h3>
          <EntryForm
            submitLabel="Add bottle"
            onSubmit={async (form) => {
              await createEntry(form);
              await refresh();
              setStats(await getAdminStats());
            }}
          />
        </div>
      </section>
    </div>
  );
}

function AdminEntry({
  entry,
  onSaved,
}: {
  entry: Entry;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sheet space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="font-display text-2xl mr-2">{entry.entryCode}</span>
          <span className="break-words">{entry.beerName}</span>{" "}
          <span className="text-muted">· {entry.brewer}</span>
          {entry.status === "hidden" && (
            <span className="ml-2 text-xs uppercase text-muted">hidden</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            className="btn-secondary min-h-12"
            onClick={() =>
              void (async () => {
                const form = new FormData();
                form.set(
                  "status",
                  entry.status === "hidden" ? "active" : "hidden",
                );
                await patchEntry(entry.id, form);
                await onSaved();
              })()
            }
          >
            {entry.status === "hidden" ? "Unhide" : "Hide"}
          </button>
          <button className="btn-secondary min-h-12" onClick={() => setOpen((v) => !v)}>
            Edit
          </button>
        </div>
      </div>
      {open && (
        <EntryForm
          initial={{
            brewer: entry.brewer,
            beerName: entry.beerName,
            style: entry.style ?? "",
            abv: entry.abv != null ? String(entry.abv) : "",
            description: entry.description ?? "",
          }}
          submitLabel="Save bottle"
          onSubmit={async (form) => {
            await patchEntry(entry.id, form);
            setOpen(false);
            await onSaved();
          }}
        />
      )}
    </div>
  );
}
