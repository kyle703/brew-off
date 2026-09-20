ALTER TABLE competitions ADD COLUMN display_settings TEXT NOT NULL DEFAULT '{"tasting":{"brewer":false,"beerName":true,"style":true,"abv":true}}';
