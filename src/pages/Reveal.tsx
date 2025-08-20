import { useEffect, useState } from "react";
import { loadData } from "../data/fetch";
import RevealDeck from "../components/RevealDeck";

export default function Reveal() {
  const [data, setData] =
    useState<
      ReturnType<typeof loadData> extends Promise<infer T> ? T : never
    >();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    console.log("Loading data for Reveal...");
    loadData()
      .then((loadedData) => {
        console.log("Data loaded successfully:", {
          categories: Object.keys(loadedData.winners),
          totalBeers: loadedData.beerList.length,
          winners: Object.entries(loadedData.winners).map(([cat, beers]) => ({
            category: cat,
            count: beers.length,
            hasGold: beers.length > 0 ? beers[0].name : "none",
          })),
        });
        setData(loadedData);
      })
      .catch((e) => {
        console.error("Failed to load data:", e);
        setErr(String(e));
      });
  }, []);

  if (err)
    return <div className="p-8 text-red-500">Failed to load data: {err}</div>;

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-200 mb-4">
            Loading Results...
          </h2>
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );

  return <RevealDeck data={data} />;
}
