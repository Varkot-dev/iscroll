-- ==================================================
-- ENGAGEMENT EVENTS TABLE
-- ==================================================
-- Depends on: schema-posts.sql (posts table must exist)
--
-- Tracks every meaningful user interaction with a card.
-- Powers adaptive depth: topics with high engagement scores
-- get deeper follow-up content served in the feed.
--
-- Event types:
--   view       — card was visible (duration_ms tells us how long)
--   chain_tap  — user tapped the chain link (strongest intent signal)
--   save       — user bookmarked the card
--   unsave     — user removed bookmark
-- ==================================================

CREATE TABLE IF NOT EXISTS engagement_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       TEXT NOT NULL DEFAULT 'anonymous',
  post_id       UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL CHECK (event_type IN ('view', 'chain_tap', 'save', 'unsave')),
  duration_ms   INTEGER,         -- only populated for 'view' events
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying a user's engagement history by time
CREATE INDEX IF NOT EXISTS idx_engagement_user_time
  ON engagement_events(user_id, created_at DESC);

-- Index for querying engagement on a specific post
CREATE INDEX IF NOT EXISTS idx_engagement_post
  ON engagement_events(post_id);

-- Index for topic-level aggregation (via join to post_topics)
CREATE INDEX IF NOT EXISTS idx_engagement_user_post
  ON engagement_events(user_id, post_id);

-- ==================================================
-- TOPIC ENGAGEMENT SCORES VIEW
-- ==================================================
-- Pre-aggregated view of how much a user has engaged with each topic.
-- Weights: chain_tap=5, save=3, unsave=-2, view scored by duration
--
-- Usage: SELECT * FROM topic_engagement_scores WHERE user_id = 'x'
-- Returns topics ranked by score — feed algorithm reads this to
-- decide which topics deserve deeper content.
-- ==================================================

CREATE OR REPLACE VIEW topic_engagement_scores AS
SELECT
  e.user_id,
  pt.topic,
  SUM(
    CASE e.event_type
      WHEN 'chain_tap' THEN 5
      WHEN 'save'      THEN 3
      WHEN 'unsave'    THEN -2
      WHEN 'view'      THEN LEAST(COALESCE(e.duration_ms, 0) / 10000.0, 3) -- max 3 pts per view (30s+)
      ELSE 0
    END
  ) AS score,
  COUNT(*) AS event_count,
  MAX(e.created_at) AS last_engaged_at
FROM engagement_events e
JOIN post_topics pt ON pt.post_id = e.post_id
GROUP BY e.user_id, pt.topic;

-- ==================================================
-- ROW LEVEL SECURITY
-- ==================================================

ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert engagement" ON engagement_events;
DROP POLICY IF EXISTS "Allow public read engagement" ON engagement_events;

CREATE POLICY "Allow public insert engagement" ON engagement_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read engagement" ON engagement_events
  FOR SELECT USING (true);
