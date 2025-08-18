// Shared data models for TSVs and derived entities

export type Registrant = {
  timestamp: string; // raw timestamp string
  brewer: string;
  beerName: string;
  style: string;
  abv: number | null;
  description: string;
  img: string; // Google Drive share link
  entryId: string; // e.g., B-001
  entryDisplay: string; // e.g., "B-001 — libre"
};

export type BeerScores = {
  drinkability: number;
  flavor: number;
  color: number;
  label: number;
  overall: number;
  votes: number;
  total: number;
};

export type Beer = {
  entryId: string;
  name: string;
  brewer?: string;
  style?: string;
  abv?: number | null;
  img?: string;
  scores: BeerScores;
};

export type LeaderboardRow = {
  entryId: string;
  beer: string;
  scores: BeerScores;
};

export type WinnerCategory =
  | "Label"
  | "Color"
  | "Drinkability"
  | "Flavor"
  | "Overall";

export type WinnerRow = {
  category: WinnerCategory;
  place: "🥇" | "🥈" | "🥉" | string; // keep permissive for dev data
  entryId: string;
  beer: string;
  avgScore: number;
  votes: number;
};

export type WinnersByCategory = Record<WinnerCategory, Beer[]>;

export type LoadedData = {
  beerList: Beer[];
  winners: WinnersByCategory;
  generatedAt: string;
};
