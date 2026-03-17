ALTER TABLE posts ADD COLUMN IF NOT EXISTS wow_fact TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS related_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS related_post_title TEXT;
CREATE INDEX IF NOT EXISTS idx_posts_related ON posts(related_post_id);
ALTER TABLE posts DROP CONSTRAINT IF EXISTS no_self_chain;
ALTER TABLE posts ADD CONSTRAINT no_self_chain CHECK (related_post_id IS DISTINCT FROM id);
