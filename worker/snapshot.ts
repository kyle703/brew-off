import type { BallotRow, EntryRow, ScoringCriterion, VoterRow } from "./types";

type ResultBeer = {
  entryCode: string;
  beerName: string;
  brewer: string;
  style?: string | null;
  abv?: number | null;
  labelUrl?: string | null;
  scores: Record<string, number>;
  votes: number;
  comments: Array<{ id: string; text: string; author?: string }>;
};

export function computeSnapshot(
  entries: EntryRow[],
  ballots: BallotRow[],
  voters: VoterRow[],
  schema: ScoringCriterion[],
  labelUrl: (key: string | null) => string | null,
): {
  beerList: ResultBeer[];
  winners: Record<string, ResultBeer[]>;
  generatedAt: string;
} {
  const voterName = new Map(voters.map((v) => [v.id, v.nickname]));
  const ballotsByEntry = new Map<string, BallotRow[]>();
  for (const b of ballots) {
    const list = ballotsByEntry.get(b.entry_id) ?? [];
    list.push(b);
    ballotsByEntry.set(b.entry_id, list);
  }

  const criteria = schema.length
    ? schema
    : [
        { id: "drinkability", label: "Drinkability" },
        { id: "flavor", label: "Flavor" },
        { id: "color", label: "Color" },
        { id: "label", label: "Label" },
        { id: "overall", label: "Overall" },
      ];

  const beerList: ResultBeer[] = entries
    .filter((e) => e.status === "active")
    .map((entry) => {
      const rows = ballotsByEntry.get(entry.id) ?? [];
      const acc: Record<string, number[]> = {};
      const comments: ResultBeer["comments"] = [];
      for (const row of rows) {
        const scores = JSON.parse(row.scores) as Record<string, number>;
        for (const [k, v] of Object.entries(scores)) {
          if (!Number.isFinite(v)) continue;
          acc[k] = acc[k] ?? [];
          acc[k].push(v);
        }
        if (row.comment?.trim()) {
          comments.push({
            id: `${entry.id}-${row.voter_id}`,
            text: row.comment.trim(),
            author: voterName.get(row.voter_id) || "Taster",
          });
        }
      }
      const avg = (key: string) => {
        const vals = acc[key] ?? [];
        if (!vals.length) return 0;
        return vals.reduce((s, n) => s + n, 0) / vals.length;
      };
      const scores: Record<string, number> = {};
      for (const c of criteria) scores[c.id] = avg(c.id);
      return {
        entryCode: entry.entry_code,
        beerName: entry.beer_name,
        brewer: entry.brewer,
        style: entry.style,
        abv: entry.abv,
        labelUrl: labelUrl(entry.label_key),
        scores,
        votes: rows.length,
        comments,
      };
    });

  const overallId = criteria.some((c) => c.id === "overall")
    ? "overall"
    : criteria[0]?.id;
  beerList.sort(
    (a, b) =>
      (b.scores[overallId] ?? 0) - (a.scores[overallId] ?? 0) ||
      b.votes - a.votes ||
      a.entryCode.localeCompare(b.entryCode),
  );

  const winners: Record<string, ResultBeer[]> = {};
  for (const c of criteria) {
    winners[c.id] = [...beerList]
      .filter((b) => b.votes > 0)
      .sort(
        (a, b) =>
          (b.scores[c.id] ?? 0) - (a.scores[c.id] ?? 0) ||
          b.votes - a.votes ||
          a.entryCode.localeCompare(b.entryCode),
      )
      .slice(0, 3);
  }

  return {
    beerList,
    winners,
    generatedAt: new Date().toISOString(),
  };
}
