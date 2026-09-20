type Props = {
  value: number | null;
  onChange: (n: number) => void;
  disabled?: boolean;
  label: string;
};

export default function ScorePips({ value, onChange, disabled, label }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="font-display text-lg text-ink">{label}</div>
      <div className="flex w-full gap-1.5 sm:w-auto sm:gap-2" role="radiogroup" aria-label={label}>
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
              className={`min-h-12 flex-1 rounded-full border-2 text-lg font-semibold transition sm:h-14 sm:max-w-14 sm:flex-none ${
                selected
                  ? "border-brass bg-accent text-paper"
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
