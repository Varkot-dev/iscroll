-- ==================================================
-- iSCROLL SIMPLIFIED SCHEMA - POSTS ONLY
-- ==================================================
-- 
-- Twitter-like feed: Just posts about different topics
-- No episodes, no rabbit holes, just scroll and discover
-- ==================================================

-- ==================================================
-- STEP 1: DROP OLD TABLES (if migrating)
-- ==================================================

DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS saved_items CASCADE;
DROP TABLE IF EXISTS rabbit_hole_topics CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS rabbit_holes CASCADE;

-- ==================================================
-- STEP 2: CREATE EXTENSIONS
-- ==================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- STEP 3: CREATE POSTS TABLE
-- ==================================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Post headline/title
  title TEXT NOT NULL,
  
  -- Main content (300-800 words, like a long tweet)
  content TEXT NOT NULL,
  
  -- When published
  published_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Optional image
  thumbnail_url TEXT,
  
  -- Optional source link
  source_url TEXT,
  
  -- Brief summary for preview
  summary TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- STEP 4: CREATE POST_TOPICS TABLE
-- ==================================================

CREATE TABLE post_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Topic tag (e.g., 'ai', 'cursor', 'claude', 'weather', 'physics')
  topic TEXT NOT NULL,
  
  -- Unique: no duplicate topics per post
  UNIQUE(post_id, topic)
);

-- ==================================================
-- STEP 5: CREATE SAVED_POSTS TABLE
-- ==================================================

CREATE TABLE saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id TEXT DEFAULT 'anonymous',
  
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique: one save per user per post
  UNIQUE(user_id, post_id)
);

-- ==================================================
-- STEP 6: CREATE INDEXES
-- ==================================================

-- Posts indexes
CREATE INDEX idx_posts_published ON posts(published_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- Topics indexes
CREATE INDEX idx_post_topics_post ON post_topics(post_id);
CREATE INDEX idx_post_topics_topic ON post_topics(topic);

-- Saved posts indexes
CREATE INDEX idx_saved_posts_user ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post ON saved_posts(post_id);

-- ==================================================
-- STEP 7: ROW LEVEL SECURITY
-- ==================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read posts" ON posts;
DROP POLICY IF EXISTS "Allow public insert posts" ON posts;
DROP POLICY IF EXISTS "Allow public update posts" ON posts;
DROP POLICY IF EXISTS "Allow public read topics" ON post_topics;
DROP POLICY IF EXISTS "Allow public insert topics" ON post_topics;
DROP POLICY IF EXISTS "Allow public read saved_posts" ON saved_posts;
DROP POLICY IF EXISTS "Allow public insert saved_posts" ON saved_posts;
DROP POLICY IF EXISTS "Allow public delete saved_posts" ON saved_posts;

-- Posts: Public read, admin write
CREATE POLICY "Allow public read posts" ON posts 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert posts" ON posts 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update posts" ON posts 
  FOR UPDATE USING (true);

-- Topics: Public read, admin write
CREATE POLICY "Allow public read topics" ON post_topics 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert topics" ON post_topics 
  FOR INSERT WITH CHECK (true);

-- Saved posts: Public all
CREATE POLICY "Allow public read saved_posts" ON saved_posts 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert saved_posts" ON saved_posts 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete saved_posts" ON saved_posts 
  FOR DELETE USING (true);

-- ==================================================
-- DONE!
-- ==================================================
-- Your simplified post-based feed is ready!
-- 
-- Next steps:
-- 1. Run this SQL in Supabase
-- 2. Update your app code to use posts instead of episodes
-- ==================================================
