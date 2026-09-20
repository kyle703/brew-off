export interface Env {
  DB: D1Database;
  LABELS: R2Bucket;
  ADMIN_PASSWORD: string;
  COOKIE_SECRET: string;
}

export type CompetitionRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  year: number;
  status: string;
  theme_id: string;
  scoring_schema: string;
  registration_open: number;
  tasting_open: number;
  entries_frozen: number;
  snapshot: string | null;
  created_at: string;
  updated_at: string;
};

export type EntryRow = {
  id: string;
  competition_id: string;
  entry_code: string;
  beer_name: string;
  brewer: string;
  style: string | null;
  abv: number | null;
  description: string | null;
  label_key: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type VoterRow = {
  id: string;
  competition_id: string;
  nickname: string | null;
  created_at: string;
};

export type BallotRow = {
  voter_id: string;
  entry_id: string;
  scores: string;
  comment: string | null;
  updated_at: string;
};

export type ScoringCriterion = { id: string; label: string };
