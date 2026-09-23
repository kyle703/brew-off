type Props = {
  value: number | null;
  onChange: (n: number) => void;
  disabled?: boolean;
  label: string;
};

export default function ScorePips({ value, onChange, disabled, label }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="shrink-0 font-display text-lg text-ink">{label}</div>
      <div
        className="grid w-full min-w-0 grid-cols-5 gap-2 sm:max-w-xs"
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(n)}
              className={`flex aspect-square w-full min-w-0 items-center justify-center rounded-full border-2 p-0 text-lg font-semibold tabular-nums transition ${
                selected
                  ? "border-brass bg-accent text-[color:var(--on-accent)]"
                  : "border-rule bg-paper text-ink hover:border-brass"
              } disabled:opacity-50`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
