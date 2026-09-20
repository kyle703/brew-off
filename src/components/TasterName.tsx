import { useEffect, useState } from "react";
import { ensureVoter } from "../api";
import { useSession } from "../context/Session";

export default function TasterName() {
  const { bootstrap, refresh } = useSession();
  const saved = bootstrap?.voter?.nickname ?? "";
  const [name, setName] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(saved);
  }, [saved]);

  async function commit() {
    const trimmed = name.trim();
    if (trimmed === saved) return;
    if (!trimmed && !bootstrap?.voter) return;
    setBusy(true);
    setError(null);
    try {
      await ensureVoter(trimmed || undefined);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sheet space-y-2">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
          Your nickname
        </span>
        <input
          className="field"
          value={name}
          maxLength={40}
          placeholder="What should we call you?"
          autoComplete="nickname"
          onChange={(e) => setName(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
      </label>
      <p className="text-xs text-muted">
        {busy
          ? "Saving…"
          : "Used on comments. One name for this phone — not per bottle."}
      </p>
      {error && <p className="text-sm text-red-800">{error}</p>}
    </div>
  );
}
