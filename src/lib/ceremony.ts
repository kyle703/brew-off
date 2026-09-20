import type { ResultBeer, ScoringCriterion } from "../types";

export type CeremonyStep =
  | { kind: "intro" }
  | { kind: "category"; criterion: ScoringCriterion }
  | {
      kind: "place";
      criterion: ScoringCriterion;
      place: 1 | 2 | 3;
      beer: ResultBeer;
      champion: boolean;
    }
  | { kind: "close" };

export function awardOrder(schema: ScoringCriterion[]): ScoringCriterion[] {
  const overall = schema.find((c) => c.id === "overall");
  const side = schema.filter((c) => c.id !== "overall");
  return overall ? [...side, overall] : schema;
}

export function buildCeremony(
  schema: ScoringCriterion[],
  winners: Record<string, ResultBeer[]>,
): CeremonyStep[] {
  const steps: CeremonyStep[] = [{ kind: "intro" }];
  const order = awardOrder(schema);

  for (const criterion of order) {
    const podium = winners[criterion.id] ?? [];
    if (podium.length === 0) continue;
    steps.push({ kind: "category", criterion });
    const last = criterion === order[order.length - 1];
    const championCategory = criterion.id === "overall" || last;
    const sequence: Array<{ place: 1 | 2 | 3; beer?: ResultBeer }> = [
      { place: 3, beer: podium[2] },
      { place: 2, beer: podium[1] },
      { place: 1, beer: podium[0] },
    ];
    for (const item of sequence) {
      if (!item.beer) continue;
      steps.push({
        kind: "place",
        criterion,
        place: item.place,
        beer: item.beer,
        champion: championCategory && item.place === 1,
      });
    }
  }

  steps.push({ kind: "close" });
  return steps;
}
