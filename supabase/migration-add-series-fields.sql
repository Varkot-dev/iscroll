-- Depends on: schema-posts.sql + migration-add-chain-fields.sql
-- Adds series grouping so cards from the same Wikipedia article stay linked

ALTER TABLE posts ADD COLUMN IF NOT EXISTS series_id UUID;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS series_position INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS series_total INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS series_title TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_series ON posts(series_id);
