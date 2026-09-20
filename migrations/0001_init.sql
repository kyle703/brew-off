CREATE TABLE competitions (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  theme_id TEXT NOT NULL DEFAULT 'baseline',
  scoring_schema TEXT NOT NULL,
  registration_open INTEGER NOT NULL DEFAULT 0,
  tasting_open INTEGER NOT NULL DEFAULT 0,
  entries_frozen INTEGER NOT NULL DEFAULT 0,
  snapshot TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL,
  entry_code TEXT NOT NULL,
  beer_name TEXT NOT NULL,
  brewer TEXT NOT NULL,
  style TEXT,
  abv REAL,
  description TEXT,
  label_key TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (competition_id, entry_code),
  FOREIGN KEY (competition_id) REFERENCES competitions(id)
);

CREATE TABLE voters (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL,
  nickname TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (competition_id) REFERENCES competitions(id)
);

CREATE TABLE ballots (
  voter_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  scores TEXT NOT NULL,
  comment TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (voter_id, entry_id),
  FOREIGN KEY (voter_id) REFERENCES voters(id),
  FOREIGN KEY (entry_id) REFERENCES entries(id)
);

CREATE INDEX idx_entries_competition ON entries(competition_id, status, entry_code);
CREATE INDEX idx_voters_competition ON voters(competition_id);
CREATE INDEX idx_ballots_entry ON ballots(entry_id);

INSERT INTO competitions (
  id, slug, name, tagline, year, status, theme_id, scoring_schema,
  registration_open, tasting_open, entries_frozen, snapshot, created_at, updated_at
) VALUES (
  '2026',
  '2026',
  'Brew-Off 2026',
  'A new vintage',
  2026,
  'draft',
  '2026',
  '[{"id":"drinkability","label":"Drinkability"},{"id":"flavor","label":"Flavor"},{"id":"color","label":"Color"},{"id":"label","label":"Label"},{"id":"overall","label":"Overall"}]',
  0, 0, 0, NULL,
  datetime('now'), datetime('now')
);
