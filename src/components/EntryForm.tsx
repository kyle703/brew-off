import { useState, type FormEvent } from "react";
import { compressImage } from "../lib/compressImage";

export type EntryFields = {
  brewer: string;
  beerName: string;
  style: string;
  abv: string;
  description: string;
  file: File | null;
};

const empty: EntryFields = {
  brewer: "",
  beerName: "",
  style: "",
  abv: "",
  description: "",
  file: null,
};

type Props = {
  initial?: Partial<EntryFields>;
  submitLabel: string;
  onSubmit: (form: FormData) => Promise<void>;
};

export default function EntryForm({ initial, submitLabel, onSubmit }: Props) {
  const [fields, setFields] = useState<EntryFields>({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("brewer", fields.brewer.trim());
      form.set("beerName", fields.beerName.trim());
      form.set("style", fields.style.trim());
      form.set("abv", fields.abv.trim());
      form.set("description", fields.description.trim());
      if (fields.file) {
        const blob = await compressImage(fields.file);
        form.set("label", new File([blob], "label.jpg", { type: "image/jpeg" }));
      }
      await onSubmit(form);
      if (!initial) setFields({ ...empty });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="sheet space-y-4">
      {error && <p className="text-sm text-red-800">{error}</p>}
      <Field
        label="Brewer"
        value={fields.brewer}
        onChange={(v) => setFields((f) => ({ ...f, brewer: v }))}
        required
      />
      <Field
        label="Beer name"
        value={fields.beerName}
        onChange={(v) => setFields((f) => ({ ...f, beerName: v }))}
        required
      />
      <Field
        label="Style"
        value={fields.style}
        onChange={(v) => setFields((f) => ({ ...f, style: v }))}
      />
      <Field
        label="ABV"
        value={fields.abv}
        onChange={(v) => setFields((f) => ({ ...f, abv: v }))}
        inputMode="decimal"
      />
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
          Notes
        </span>
        <textarea
          className="field min-h-24"
          value={fields.description}
          onChange={(e) =>
            setFields((f) => ({ ...f, description: e.target.value }))
          }
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
          Label photo
        </span>
        <span className="btn-secondary flex w-full cursor-pointer">
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) =>
              setFields((f) => ({ ...f, file: e.target.files?.[0] ?? null }))
            }
          />
          {fields.file ? fields.file.name : "Take or choose a photo"}
        </span>
      </label>
      <button className="btn-primary w-full" disabled={busy} type="submit">
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  inputMode?: "decimal";
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        className="field"
        value={value}
        required={required}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
