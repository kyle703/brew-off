export type CompetitionStatus =
  | "draft"
  | "registration"
  | "tasting"
  | "closed"
  | "reveal"
  | "published";

export type ScoringCriterion = {
  id: string;
  label: string;
};

export type Competition = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  year: number;
  status: CompetitionStatus;
  themeId: string;
  scoringSchema: ScoringCriterion[];
  registrationOpen: boolean;
  tastingOpen: boolean;
  entriesFrozen: boolean;
};

export type Entry = {
  id: string;
  entryCode: string;
  beerName: string;
  brewer: string;
  style: string | null;
  abv: number | null;
  description: string | null;
  labelUrl: string | null;
  status: "active" | "hidden";
};

export type Voter = {
  id: string;
  nickname: string | null;
};

export type Ballot = {
  entryId: string;
  entryCode: string;
  scores: Record<string, number>;
  comment: string | null;
  updatedAt: string;
};

export type AdminStats = {
  tasters: number;
  ballots: number;
  entries: Array<{
    id: string;
    entryCode: string;
    beerName: string;
    ballotCount: number;
  }>;
};

export type Bootstrap = {
  competition: Competition;
  entries: Entry[];
  voter: Voter | null;
  ballots: Ballot[];
  isAdmin: boolean;
};

export type BeerComment = {
  id: string;
  text: string;
  author?: string;
};

export type ResultBeer = {
  entryCode: string;
  beerName: string;
  brewer: string;
  style?: string | null;
  abv?: number | null;
  labelUrl?: string | null;
  scores: Record<string, number>;
  votes: number;
  comments: BeerComment[];
};

export type LoadedData = {
  beerList: ResultBeer[];
  winners: Record<string, ResultBeer[]>;
  generatedAt: string;
};

export const DEFAULT_SCORING_SCHEMA: ScoringCriterion[] = [
  { id: "drinkability", label: "Drinkability" },
  { id: "flavor", label: "Flavor" },
  { id: "color", label: "Color" },
  { id: "label", label: "Label" },
  { id: "overall", label: "Overall" },
];
