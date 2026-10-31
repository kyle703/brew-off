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

const DEFAULT_CRITERIA: ScoringCriterion[] = [
  { id: "drinkability", label: "Drinkability" },
  { id: "flavor", label: "Flavor" },
  { id: "color", label: "Color" },
  { id: "label", label: "Label" },
  { id: "overall", label: "Overall" },
];

function criteriaOf(schema: ScoringCriterion[]): ScoringCriterion[] {
  return schema.length ? schema : DEFAULT_CRITERIA;
}

export function rankKey(schema: ScoringCriterion[]): string {
  const criteria = criteriaOf(schema);
  return criteria.some((c) => c.id === "overall")
    ? "overall"
    : (criteria[0]?.id ?? "overall");
}

function ballotsByEntry(ballots: BallotRow[]): Map<string, BallotRow[]> {
  const grouped = new Map<string, BallotRow[]>();
  for (const ballot of ballots) {
    const list = grouped.get(ballot.entry_id) ?? [];
    list.push(ballot);
    grouped.set(ballot.entry_id, list);
  }
  return grouped;
}

function averages(
  rows: BallotRow[],
  criteria: ScoringCriterion[],
): Record<string, number> {
  const acc: Record<string, number[]> = {};
  for (const row of rows) {
    const scores = JSON.parse(row.scores) as Record<string, number>;
    for (const [key, value] of Object.entries(scores)) {
      if (!Number.isFinite(value)) continue;
      acc[key] = acc[key] ?? [];
      acc[key].push(value);
    }
  }
  const scores: Record<string, number> = {};
  for (const criterion of criteria) {
    const vals = acc[criterion.id] ?? [];
    scores[criterion.id] = vals.length
      ? vals.reduce((sum, n) => sum + n, 0) / vals.length
      : 0;
  }
  return scores;
}

function byRank(overallId: string) {
  return (
    a: { scores: Record<string, number>; votes: number; entryCode: string },
    b: { scores: Record<string, number>; votes: number; entryCode: string },
  ) =>
    (b.scores[overallId] ?? 0) - (a.scores[overallId] ?? 0) ||
    b.votes - a.votes ||
    a.entryCode.localeCompare(b.entryCode);
}

export type TallyEntry = {
  id: string;
  entryCode: string;
  beerName: string;
  brewer: string;
  labelUrl: string | null;
  status: "active" | "hidden";
  ballotCount: number;
  scores: Record<string, number>;
};

/** Ranked like the frozen results: overall average, then ballot count, then code. */
export function computeTally(
  entries: EntryRow[],
  ballots: BallotRow[],
  schema: ScoringCriterion[],
  labelUrl: (key: string | null) => string | null,
): TallyEntry[] {
  const criteria = criteriaOf(schema);
  const grouped = ballotsByEntry(ballots);
  const rows: TallyEntry[] = entries.map((entry) => {
    const votes = grouped.get(entry.id) ?? [];
    return {
      id: entry.id,
      entryCode: entry.entry_code,
      beerName: entry.beer_name,
      brewer: entry.brewer,
      labelUrl: labelUrl(entry.label_key),
      status: entry.status === "hidden" ? "hidden" : "active",
      ballotCount: votes.length,
      scores: averages(votes, criteria),
    };
  });
  const ranked = rows
    .filter((row) => row.ballotCount > 0)
    .sort((a, b) =>
      byRank(rankKey(criteria))(
        { ...a, votes: a.ballotCount },
        { ...b, votes: b.ballotCount },
      ),
    );
  const open = rows
    .filter((row) => row.ballotCount === 0 && row.status === "active")
    .sort((a, b) =>
      a.entryCode.localeCompare(b.entryCode, undefined, { numeric: true }),
    );
  return [...ranked, ...open];
}

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
  const grouped = ballotsByEntry(ballots);
  const criteria = criteriaOf(schema);

  const beerList: ResultBeer[] = entries
    .filter((e) => e.status === "active")
    .map((entry) => {
      const rows = grouped.get(entry.id) ?? [];
      const comments: ResultBeer["comments"] = [];
      for (const row of rows) {
        if (row.comment?.trim()) {
          comments.push({
            id: `${entry.id}-${row.voter_id}`,
            text: row.comment.trim(),
            author: voterName.get(row.voter_id) || "Taster",
          });
        }
      }
      return {
        entryCode: entry.entry_code,
        beerName: entry.beer_name,
        brewer: entry.brewer,
        style: entry.style,
        abv: entry.abv,
        labelUrl: labelUrl(entry.label_key),
        scores: averages(rows, criteria),
        votes: rows.length,
        comments,
      };
    });

  const overallId = rankKey(criteria);
  beerList.sort(byRank(overallId));

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
