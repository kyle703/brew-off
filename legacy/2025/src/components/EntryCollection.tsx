import type { Beer } from "../types";
import EntryOverlayCard from "./EntryOverlayCard";

const SCORES: { key: keyof Beer["scores"]; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "label", label: "Label" },
  { key: "color", label: "Color" },
  { key: "drinkability", label: "Drink" },
  { key: "flavor", label: "Flavor" },
];

type Props = {
  beers: Beer[];
};

export default function EntryCollection({ beers }: Props) {
  const entries = [...beers].sort((a, b) => a.entryId.localeCompare(b.entryId));

  return (
    <section aria-label="Entries" className="mx-auto mb-12 max-w-5xl">
      <h2 className="heading-fest mb-6 text-center text-4xl sm:mb-8 sm:text-5xl">The entries</h2>
      <ul className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        {entries.map((beer) => (
          <li
            key={beer.entryId}
            className="flex flex-col items-center rounded-[24px] border-2 border-gold-600 bg-navy-900 px-4 py-5 sm:px-5"
          >
            <EntryOverlayCard
              imageUrl={beer.img || ""}
              name={beer.name}
              entryId={beer.entryId}
              brewer={beer.brewer}
              size="docked"
              width="min(210px, 62vw)"
            />
            <div className="mt-4 w-full text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                {beer.entryId}
                {beer.abv == null ? "" : ` · ${beer.abv.toFixed(1).replace(".", ",")}% ABV`}
              </p>
              {beer.style ? (
                <p className="mt-1 font-fraktur text-2xl leading-tight text-cream-100">{beer.style}</p>
              ) : null}
              {description(beer) ? (
                <p className="mt-2 text-sm leading-relaxed text-cream-100/85">{description(beer)}</p>
              ) : null}
              <dl className="mt-4 flex flex-wrap justify-center gap-2">
                {SCORES.map(({ key, label }) => (
                  <div
                    key={key}
                    className="min-w-[4.25rem] rounded-lg border-2 border-gold-200 bg-parchment px-2 py-1 text-navy-900"
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</dt>
                    <dd className="text-lg font-bold leading-none">{beer.scores[key].toFixed(1)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function description(beer: Beer) {
  const line = beer.comments?.find((comment) => comment.id.endsWith("-desc"));
  const text = line?.text.trim();
  return text || null;
}
