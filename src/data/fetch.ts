// src/data/fetch.ts
import { getCached, setCached } from "./cache";
import { toDirectImageUrl } from "./drive";
import type {
  Beer,
  BeerScores,
  LeaderboardRow,
  LoadedData,
  Registrant,
  WinnerCategory,
  WinnersByCategory,
  BeerComment,
} from "../types";

const toNum = (s: string): number | null => {
  if (s == null) return null;
  const cleaned = String(s).trim().replace(/,/g, ".").replace(/[^0-9.+\-]/g, "");
  if (cleaned === "" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};
const toNum0 = (s: string): number => {
  if (s == null) return 0;
  const cleaned = String(s).trim().replace(/,/g, ".").replace(/[^0-9.+\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const tsv = async (url: string): Promise<string[][]> =>
  (await (await fetch(url, { cache: "no-store" })).text())
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"));

function parseRegistrants(table: string[][]): Registrant[] {
  const [header, ...rows] = table;
  const headerNorm = header.map((h) => h.trim().toLowerCase());
  const H = (h: string) => header.indexOf(h);
  const Hn = (h: string) => headerNorm.indexOf(h.trim().toLowerCase());
  const find = (names: string[]) => {
    for (const name of names) {
      const i = H(name);
      if (i !== -1) return i;
      const j = Hn(name);
      if (j !== -1) return j;
    }
    // fuzzy: look for includes
    const needle = names[0].trim().toLowerCase();
    const k = headerNorm.findIndex((h) => h.includes(needle));
    return k;
  };
  const idx = {
    timestamp: find(["Timestamp"]),
    brewer: find(["Brewer's Name", "Brewer", "Brewer Name"]),
    beerName: find(["Beer Name", "Beer"]),
    style: find(["Style"]),
    abv: find(["ABV", "% ABV", "Alcohol" ]),
    description: find(["Description", "Notes", "Comment"]),
    img: find(["Beer Label", "Label", "Image"]),
    entryId: find(["EntryID", "Entry Id", "Entry ID"]),
    entryDisplay: find(["Entry Display", "Entry"]),
  };
  return rows
    .filter((r) => idx.entryId !== -1 && r[idx.entryId])
    .map((r) => {
      // Convert image URLs to direct CDN URLs during parsing
      const originalImg = idx.img !== -1 ? r[idx.img] : undefined;
      const img = originalImg ? toDirectImageUrl(originalImg) : undefined;

      return {
        timestamp: idx.timestamp !== -1 ? r[idx.timestamp] : "",
        brewer: idx.brewer !== -1 ? r[idx.brewer] : "",
        beerName: idx.beerName !== -1 ? r[idx.beerName] : "",
        style: idx.style !== -1 ? r[idx.style] : "",
        abv: idx.abv !== -1 ? toNum(r[idx.abv] ?? "") : null,
        description: idx.description !== -1 ? r[idx.description] : "",
        img, // Use the transformed URL
        entryId: r[idx.entryId],
        entryDisplay: idx.entryDisplay !== -1 ? r[idx.entryDisplay] : r[idx.entryId],
      } as Registrant;
    });
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
  const SCALE = 2; // convert 5-point scale to 10-point for display
  return rows
    .filter((r) => r[idx.entryId])
    .map((r) => ({
      entryId: r[idx.entryId],
      beer: r[idx.beer],
      scores: {
        drinkability: toNum0(r[idx.dri] as unknown as string) * SCALE,
        flavor: toNum0(r[idx.fla] as unknown as string) * SCALE,
        color: toNum0(r[idx.col] as unknown as string) * SCALE,
        label: toNum0(r[idx.lab] as unknown as string) * SCALE,
        overall: toNum0(r[idx.ovr] as unknown as string) * SCALE,
        total: toNum0(r[idx.tot] as unknown as string) * SCALE,
        votes: toNum0(r[idx.vot] as unknown as string),
      },
    }));
}

// Parse raw judge results where each column like "[B-001] Beer — Comments (optional)"
function parseRawResultsComments(table: string[][]): Map<string, BeerComment[]> {
  const [header, ...rows] = table;
  const commentsByEntry = new Map<string, BeerComment[]>();

  // Find a judge name column if present
  const judgeIdx = header.findIndex((h) => /judge/i.test(h));

  // Build a map of entryId -> column index for comment fields
  const entryCols: Array<{ entryId: string; col: number }> = [];
  header.forEach((h, i) => {
    const match = h.match(/\[\s*([^\]]+?)\s*\]/); // capture text inside []
    const isComment = /comment/i.test(h);
    if (match && isComment) {
      const entryId = match[1].trim();
      if (entryId) entryCols.push({ entryId, col: i });
    }
  });

  rows.forEach((r, rowIdx) => {
    const author = judgeIdx !== -1 ? r[judgeIdx] || `Judge ${rowIdx + 1}` : `Judge ${rowIdx + 1}`;
    entryCols.forEach(({ entryId, col }) => {
      const text = (r[col] || "").trim();
      if (!text) return;
      const list = commentsByEntry.get(entryId) || [];
      list.push({ id: `${entryId}-j${rowIdx + 1}-${col}`, text, author });
      commentsByEntry.set(entryId, list);
    });
  });

  return commentsByEntry;
}

export async function loadData(force: boolean = false): Promise<LoadedData> {
  const cacheKey = "brew-off:data:v1";
  if (!force) {
    const cached = getCached<LoadedData>(cacheKey, 5 * 60 * 1000);
    if (cached) return cached;
  }

  const rawResultsUrl = (import.meta.env as any).VITE_TSV_RAW_RESULTS as string | undefined;

  const [reg, lb, win, raw] = await Promise.all([
    tsv(import.meta.env.VITE_TSV_REGISTRANTS),
    tsv(import.meta.env.VITE_TSV_LEADERBOARD),
    tsv(import.meta.env.VITE_TSV_WINNERS),
    rawResultsUrl ? tsv(rawResultsUrl) : Promise.resolve<string[][]>([]),
  ]);

  const registrants = parseRegistrants(reg);
  const regById = new Map<string, Registrant>(
    registrants.map((r) => [r.entryId, r])
  );

  const lbRows = parseLeaderboard(lb);
  const judgeCommentsByEntry = raw.length > 0 ? parseRawResultsComments(raw) : new Map<string, BeerComment[]>();

  const beersMap = new Map<string, Beer>();
  for (const row of lbRows) {
    const meta = regById.get(row.entryId);

    // Build optional brewer comment from description if present
    const commentsFromBrewer: BeerComment[] = meta?.description
      ? [
          {
            id: `${row.entryId}-desc`,
            text: meta.description,
            author: meta.brewer || "Brewer",
          },
        ]
      : [];

    const judgeComments = judgeCommentsByEntry.get(row.entryId) || [];

    beersMap.set(row.entryId, {
      entryId: row.entryId,
      name: meta?.beerName ?? row.beer,
      brewer: meta?.brewer,
      style: meta?.style,
      abv: meta?.abv ?? null,
      img: meta?.img,
      scores: row.scores,
      comments: [...commentsFromBrewer, ...judgeComments],
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
