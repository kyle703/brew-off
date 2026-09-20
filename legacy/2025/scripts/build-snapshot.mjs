import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const toNum = (s) => {
  if (s == null) return null;
  const cleaned = String(s).trim().replace(/,/g, ".").replace(/[^0-9.+\-]/g, "");
  if (cleaned === "" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};
const toNum0 = (s) => {
  const n = toNum(s);
  return n ?? 0;
};

const parseTsv = (file) =>
  readFileSync(join(pub, file), "utf8")
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"));

const toDirectImageUrl = (fileIdOrUrl) => {
  const idParam = fileIdOrUrl.match(/[?&]id=([^&#]+)/)?.[1];
  const fileMatch = fileIdOrUrl.match(/\/file\/d\/([^/]+)/)?.[1];
  const id = (fileMatch || idParam || fileIdOrUrl).trim();
  return `https://lh3.googleusercontent.com/d/${id}=w1200`;
};

function findHeader(header, names, includesNeedle) {
  const headerNorm = header.map((h) => h.trim().toLowerCase());
  const H = (s) => header.indexOf(s);
  const Hn = (s) => headerNorm.indexOf(s.trim().toLowerCase());
  for (const n of names) {
    const i = H(n);
    if (i !== -1) return i;
    const j = Hn(n);
    if (j !== -1) return j;
  }
  if (includesNeedle) {
    const needle = includesNeedle.trim().toLowerCase();
    return headerNorm.findIndex((x) => x.includes(needle));
  }
  const needle = names[0].trim().toLowerCase();
  return headerNorm.findIndex((h) => h.includes(needle));
}

const [regHeader, ...regRows] = parseTsv("registrants.tsv");
const registrants = regRows
  .filter((r) => findHeader(regHeader, ["EntryID", "Entry Id", "Entry ID"]) !== -1 && r[findHeader(regHeader, ["EntryID", "Entry Id", "Entry ID"])])
  .map((r) => {
    const idx = {
      timestamp: findHeader(regHeader, ["Timestamp"]),
      brewer: findHeader(regHeader, ["Brewer's Name", "Brewer", "Brewer Name"]),
      beerName: findHeader(regHeader, ["Beer Name", "Beer"]),
      style: findHeader(regHeader, ["Style"]),
      abv: findHeader(regHeader, ["ABV", "% ABV", "Alcohol"]),
      description: findHeader(regHeader, ["Description", "Notes", "Comment"]),
      img: findHeader(regHeader, ["Beer Label", "Label", "Image"]),
      entryId: findHeader(regHeader, ["EntryID", "Entry Id", "Entry ID"]),
      entryDisplay: findHeader(regHeader, ["Entry Display", "Entry"]),
    };
    const originalImg = idx.img !== -1 ? r[idx.img] : undefined;
    return {
      timestamp: idx.timestamp !== -1 ? r[idx.timestamp] : "",
      brewer: idx.brewer !== -1 ? r[idx.brewer] : "",
      beerName: idx.beerName !== -1 ? r[idx.beerName] : "",
      style: idx.style !== -1 ? r[idx.style] : "",
      abv: idx.abv !== -1 ? toNum(r[idx.abv] ?? "") : null,
      description: idx.description !== -1 ? r[idx.description] : "",
      img: originalImg ? toDirectImageUrl(originalImg) : undefined,
      entryId: r[idx.entryId],
      entryDisplay: idx.entryDisplay !== -1 ? r[idx.entryDisplay] : r[idx.entryId],
    };
  });

const [lbHeader, ...lbRows] = parseTsv("leaderboard.tsv");
const SCALE = 2;
const lbParsed = lbRows
  .filter((r) => r[findHeader(lbHeader, ["EntryID", "Entry Id", "Entry ID", "id"], "entry")])
  .map((r) => {
    const idx = {
      entryId: findHeader(lbHeader, ["EntryID", "Entry Id", "Entry ID", "id"], "entry"),
      beer: findHeader(lbHeader, ["Beer", "Beer Name"], "beer"),
      dri: findHeader(lbHeader, ["Avg Drinkability", "Drinkability Avg", "Drinkability"], "drink"),
      fla: findHeader(lbHeader, ["Avg Flavor", "Flavor Avg", "Flavor"], "flavor"),
      col: findHeader(lbHeader, ["Avg Color", "Color Avg", "Color"], "color"),
      lab: findHeader(lbHeader, ["Avg Label", "Label Avg", "Label"], "label"),
      ovr: findHeader(lbHeader, ["Avg Overall", "Overall Avg", "Overall"], "overall"),
      vot: findHeader(lbHeader, ["Votes", "# Votes", "Num Votes"], "vote"),
      tot: findHeader(lbHeader, ["Total", "Score Total", "Total Score"], "total"),
    };
    return {
      entryId: r[idx.entryId],
      beer: idx.beer !== -1 ? r[idx.beer] : r[idx.entryId],
      scores: {
        drinkability: idx.dri !== -1 ? toNum0(r[idx.dri]) * SCALE : 0,
        flavor: idx.fla !== -1 ? toNum0(r[idx.fla]) * SCALE : 0,
        color: idx.col !== -1 ? toNum0(r[idx.col]) * SCALE : 0,
        label: idx.lab !== -1 ? toNum0(r[idx.lab]) * SCALE : 0,
        overall: idx.ovr !== -1 ? toNum0(r[idx.ovr]) * SCALE : 0,
        total: idx.tot !== -1 ? toNum0(r[idx.tot]) * SCALE : 0,
        votes: idx.vot !== -1 ? toNum0(r[idx.vot]) : 0,
      },
    };
  });

const [rawHeader, ...rawRows] = parseTsv("raw.tsv");
const commentsByEntry = new Map();
const judgeIdx = rawHeader.findIndex((h) => /judge/i.test(h));
const entryCols = [];
rawHeader.forEach((h, i) => {
  const match = h.match(/\[\s*([^\]]+?)\s*\]/);
  const isComment = /comment/i.test(h);
  if (match && isComment) {
    const entryId = match[1].trim();
    if (entryId) entryCols.push({ entryId, col: i });
  }
});
rawRows.forEach((r, rowIdx) => {
  const author = judgeIdx !== -1 ? r[judgeIdx] || `Judge ${rowIdx + 1}` : `Judge ${rowIdx + 1}`;
  entryCols.forEach(({ entryId, col }) => {
    const text = (r[col] || "").trim();
    if (!text) return;
    const list = commentsByEntry.get(entryId) || [];
    list.push({ id: `${entryId}-j${rowIdx + 1}-${col}`, text, author });
    commentsByEntry.set(entryId, list);
  });
});

const regById = new Map(registrants.map((r) => [r.entryId, r]));
const beersMap = new Map();
for (const reg of registrants) {
  const judgeComments = commentsByEntry.get(reg.entryId) || [];
  const commentsFromBrewer = reg.description
    ? [{ id: `${reg.entryId}-desc`, text: reg.description, author: reg.brewer || "Brewer" }]
    : [];
  beersMap.set(reg.entryId, {
    entryId: reg.entryId,
    name: reg.beerName,
    brewer: reg.brewer,
    style: reg.style,
    abv: reg.abv ?? null,
    img: reg.img,
    scores: { drinkability: 0, flavor: 0, color: 0, label: 0, overall: 0, votes: 0, total: 0 },
    comments: [...commentsFromBrewer, ...judgeComments],
  });
}
for (const row of lbParsed) {
  const meta = regById.get(row.entryId);
  const existing = beersMap.get(row.entryId);
  const judgeComments = commentsByEntry.get(row.entryId) || [];
  const commentsFromBrewer = meta?.description
    ? [{ id: `${row.entryId}-desc`, text: meta.description, author: meta.brewer || "Brewer" }]
    : [];
  beersMap.set(row.entryId, {
    entryId: row.entryId,
    name: meta?.beerName ?? existing?.name ?? row.beer,
    brewer: meta?.brewer ?? existing?.brewer,
    style: meta?.style ?? existing?.style,
    abv: meta?.abv ?? existing?.abv ?? null,
    img: meta?.img ?? existing?.img,
    scores: row.scores,
    comments: [...commentsFromBrewer, ...judgeComments],
  });
}

const winners = { Label: [], Color: [], Drinkability: [], Flavor: [], Overall: [] };
const [wH, ...wRows] = parseTsv("winners.tsv");
const wIdx = { cat: wH.indexOf("Category"), id: wH.indexOf("EntryID") };
for (const r of wRows) {
  const cat = r[wIdx.cat];
  const id = r[wIdx.id];
  if (!cat || !id || !winners[cat]) continue;
  const beer = beersMap.get(id);
  if (!beer) continue;
  winners[cat].push(beer);
}
const catKey = { Label: "label", Color: "color", Drinkability: "drinkability", Flavor: "flavor", Overall: "overall" };
for (const cat of Object.keys(winners)) {
  winners[cat].sort((a, b) => b.scores[catKey[cat]] - a.scores[catKey[cat]]);
}

const beerList = Array.from(beersMap.values());
beerList.sort((a, b) => b.scores.overall - a.scores.overall || b.scores.total - a.scores.total);

const result = {
  beerList,
  winners,
  generatedAt: "2025-08-24T00:00:00.000Z",
};

writeFileSync(join(pub, "snapshot.json"), JSON.stringify(result, null, 2));
console.log(`Wrote snapshot.json with ${beerList.length} beers`);
