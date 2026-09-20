import { useState } from "react";
import { Link } from "react-router-dom";
import { createEntry } from "../api";
import EntryForm from "../components/EntryForm";
import { useSession } from "../context/Session";

export default function Register() {
  const { bootstrap, refresh } = useSession();
  const [code, setCode] = useState<string | null>(null);

  if (!bootstrap) return null;
  if (!bootstrap.competition.registrationOpen && !bootstrap.isAdmin) {
    return (
      <div className="sheet text-center">
        <h1 className="font-display text-3xl">Registration is closed</h1>
        <Link to="/" className="mt-4 inline-block text-accent">
          Back
        </Link>
      </div>
    );
  }

  if (code) {
    return (
      <div className="sheet space-y-4 text-center">
        <p className="kicker">You’re in</p>
        <h1 className="font-display text-6xl text-accent">{code}</h1>
        <p className="text-muted">
          That’s your bottle number. Tape it on and don’t lose it.
        </p>
        <button className="btn-secondary" onClick={() => setCode(null)}>
          Register another
        </button>
        <div>
          <Link to="/" className="text-accent">
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-accent">Register a beer</h1>
      <EntryForm
        submitLabel="Get a bottle number"
        onSubmit={async (form) => {
          const entry = await createEntry(form);
          setCode(entry.entryCode);
          await refresh();
        }}
      />
    </div>
  );
}
