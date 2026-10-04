import { Link } from "react-router-dom";
import type { Beer, WinnerCategory } from "../types";
import CategoryPlacard from "../components/CategoryPlacard";
import EntryCollection from "../components/EntryCollection";
import { useData } from "../context/DataProvider";

const CATEGORIES: WinnerCategory[] = ["Overall", "Label", "Color", "Drinkability", "Flavor"];

export default function Leaderboard() {
  const { data, loading, error } = useData();

  if (error) return <div className="text-center text-red-400">Couldn’t load the 2025 results.</div>;
  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-amber-200">
        Loading…
      </div>
    );
  }

  const rows: Beer[] = data.beerList;
  const called = new Date(data.generatedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-[calc(100svh-var(--nav-h))] w-full pb-10">
      <header className="mx-auto mb-5 max-w-3xl px-2 text-center sm:mb-8">
        <h1 className="heading-fest text-4xl sm:text-6xl">Aug-toberfest</h1>
        <p className="mt-2 flex items-center justify-center gap-2 text-amber-400">
          <span aria-hidden style={{ transform: "scaleX(-1)" }}>
            🍺
          </span>
          <span className="heading-fest text-lg tracking-wide sm:text-2xl sm:tracking-widest">Golden Spoon 2025</span>
          <span aria-hidden>🍺</span>
        </p>
        <img
          src={`${import.meta.env.BASE_URL}golden_spoon_hero.png`}
          alt="Golden Spoon"
          className="mx-auto mt-2 h-16 w-auto sm:mt-3 sm:h-28"
        />
        <Link
          to="/reveal"
          className="mt-4 inline-block text-sm font-semibold uppercase tracking-[0.18em] text-amber-400 hover:text-amber-300"
        >
          Replay the reveal
        </Link>
      </header>

      <EntryCollection beers={rows} />

      <h2 className="heading-fest mb-6 text-center text-4xl sm:mb-8 sm:text-5xl">The card</h2>
      <div className="space-y-8 sm:space-y-10">
        {CATEGORIES.map((cat) => (
          <CategoryPlacard key={cat} category={cat} rows={rows} />
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-amber-200/60">Called {called}</p>
    </div>
  );
}
