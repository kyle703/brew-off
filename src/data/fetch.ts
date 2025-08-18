// src/data/fetch.ts
import { getCached, setCached } from "./cache";
import type {
  Beer,
  BeerScores,
  LeaderboardRow,
  LoadedData,
  Registrant,
  WinnerCategory,
  WinnersByCategory,
} from "../types";

const toNum = (s: string): number | null => (s === "" ? null : Number(s));
const toNum0 = (s: string): number => Number(s || 0);

const tsv = async (url: string): Promise<string[][]> =>
  (await (await fetch(url, { cache: "no-store" })).text())
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"));

function parseRegistrants(table: string[][]): Registrant[] {
  const [header, ...rows] = table;
  const H = (h: string) => header.indexOf(h);
  const idx = {
    timestamp: H("Timestamp"),
    brewer: H("Brewer's Name"),
    beerName: H("Beer Name"),
    style: H("Style"),
    abv: H("ABV"),
    description: H("Description"),
    img: H("Beer Label"),
    entryId: H("EntryID"),
    entryDisplay: H("Entry Display"),
  };
  return rows
    .filter((r) => r[idx.entryId])
    .map((r) => ({
      timestamp: r[idx.timestamp],
      brewer: r[idx.brewer],
      beerName: r[idx.beerName],
      style: r[idx.style],
      abv: toNum(r[idx.abv] || ""),
      description: r[idx.description],
      img: r[idx.img],
      entryId: r[idx.entryId],
      entryDisplay: r[idx.entryDisplay],
    }));
}

function parseLeaderboard(table: string[][]): LeaderboardRow[] {
  const [h, ...rows] = table;
  const H = (s: string) => h.indexOf(s);
  const idx = {
    entryId: H("EntryID"),
    beer: H("Beer"),
    dri: H("Avg Drinkability"),
    fla: H("Avg Flavor"),
    col: H("Avg Color"),
    lab: H("Avg Label"),
    ovr: H("Avg Overall"),
    vot: H("Votes"),
    tot: H("Total"),
  };
  return rows
    .filter((r) => r[idx.entryId])
    .map((r) => ({
      entryId: r[idx.entryId],
      beer: r[idx.beer],
      scores: {
        drinkability: toNum0(r[idx.dri]),
        flavor: toNum0(r[idx.fla]),
        color: toNum0(r[idx.col]),
        label: toNum0(r[idx.lab]),
        overall: toNum0(r[idx.ovr]),
        total: toNum0(r[idx.tot]),
        votes: toNum0(r[idx.vot]),
      },
    }));
}

export async function loadData(): Promise<LoadedData> {
  const cacheKey = "brew-off:data:v1";
  const cached = getCached<LoadedData>(cacheKey, 5 * 60 * 1000);
  if (cached) return cached;

  const [reg, lb, win] = await Promise.all([
    tsv(import.meta.env.VITE_TSV_REGISTRANTS),
    tsv(import.meta.env.VITE_TSV_LEADERBOARD),
    tsv(import.meta.env.VITE_TSV_WINNERS),
  ]);

  const registrants = parseRegistrants(reg);
  const regById = new Map<string, Registrant>(
    registrants.map((r) => [r.entryId, r])
  );

  const lbRows = parseLeaderboard(lb);
  const beersMap = new Map<string, Beer>();
  for (const row of lbRows) {
    const meta = regById.get(row.entryId);
    beersMap.set(row.entryId, {
      entryId: row.entryId,
      name: meta?.beerName ?? row.beer,
      brewer: meta?.brewer,
      style: meta?.style,
      abv: meta?.abv ?? null,
      img: meta?.img,
      scores: row.scores,
    });
  }

  // Winners by category
  const winners: WinnersByCategory = {
    Label: [],
    Color: [],
    Drinkability: [],
    Flavor: [],
    Overall: [],
  };
  const [wH, ...wRows] = win;
  const WH = (s: string) => wH.indexOf(s);
  const wIdx = {
    cat: WH("Category"),
    id: WH("EntryID"),
    place: WH("Place"),
  };
  for (const r of wRows) {
    const cat = r[wIdx.cat] as WinnerCategory;
    const id = r[wIdx.id];
    if (!cat || !id) continue;
    const beer = beersMap.get(id);
    if (!beer) continue;
    winners[cat].push(beer);
  }
  const catKey = {
    Label: "label",
    Color: "color",
    Drinkability: "drinkability",
    Flavor: "flavor",
    Overall: "overall",
  } as const;
  (Object.keys(winners) as (keyof typeof winners)[]).forEach((cat) => {
    const k = catKey[cat];
    winners[cat].sort(
      (a: Beer, b: Beer) =>
        b.scores[k as keyof BeerScores] - a.scores[k as keyof BeerScores]
    );
  });

  const beerList = Array.from(beersMap.values());
  beerList.sort(
    (a, b) =>
      b.scores.overall - a.scores.overall || b.scores.total - a.scores.total
  );

  const result: LoadedData = {
    beerList,
    winners,
    generatedAt: new Date().toISOString(),
  };
  setCached(cacheKey, result);
  return result;
}
