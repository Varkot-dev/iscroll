-- ==================================================
-- ADD DEPTH + SUBTOPIC SUPPORT
-- ==================================================
-- Depends on: schema-posts.sql, migration-add-chain-fields.sql
--
-- Changes:
--   1. posts.depth         — integer 1-5, how deep the content is
--   2. post_topics.kind    — 'topic' (broad) or 'subtopic' (specific)
--
-- Depth scale:
--   1 = surface (anyone can follow)
--   2 = beginner (some context needed)
--   3 = intermediate (solid foundation assumed)
--   4 = advanced (domain knowledge required)
--   5 = expert (research-level)
-- ==================================================

-- Add depth to posts (default 1 = surface level)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS depth INTEGER NOT NULL DEFAULT 1;
ALTER TABLE posts ADD CONSTRAINT depth_range CHECK (depth BETWEEN 1 AND 5);

-- Add kind to post_topics to distinguish broad topics from subtopics
ALTER TABLE post_topics ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'topic';
ALTER TABLE post_topics ADD CONSTRAINT kind_values CHECK (kind IN ('topic', 'subtopic'));

-- Index for querying cards at a specific depth within a topic
CREATE INDEX IF NOT EXISTS idx_post_topics_kind ON post_topics(kind);
