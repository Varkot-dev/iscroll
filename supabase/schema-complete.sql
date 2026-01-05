-- ==================================================
-- iSCROLL DATABASE SCHEMA v2.0 - RABBIT HOLES
-- COMPLETE RESET VERSION
-- ==================================================
-- 
-- HOW TO USE THIS FILE:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" (or press Cmd+Enter / Ctrl+Enter)
-- 
-- This will DROP all existing tables and recreate them fresh.
-- Use this if you're getting column errors from old schema.
-- ==================================================

-- ==================================================
-- STEP 1: DROP EXISTING TABLES (in reverse dependency order)
-- ==================================================

DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS saved_items CASCADE;
DROP TABLE IF EXISTS rabbit_hole_topics CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS rabbit_holes CASCADE;

-- Drop existing functions (triggers will be dropped automatically when tables are dropped)
DROP FUNCTION IF EXISTS get_unread_count(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_episode_count() CASCADE;

-- ==================================================
-- STEP 2: CREATE EXTENSIONS
-- ==================================================

-- Enable UUID extension (for generating unique IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- STEP 3: CREATE TABLES
-- ==================================================

-- RABBIT_HOLES TABLE
-- Main topics users can follow
-- Each rabbit hole contains multiple episodes
CREATE TABLE rabbit_holes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Display title (e.g., "The Race to Nuclear Fusion")
  title TEXT NOT NULL,
  
  -- Longer description of what this rabbit hole covers
  description TEXT NOT NULL,
  
  -- FOMO-inducing teaser text shown in feed cards
  hook_text TEXT NOT NULL,
  
  -- Type of content: series (planned) or live (news-driven)
  type TEXT NOT NULL CHECK (type IN ('series', 'live')),
  
  -- Current status of the rabbit hole
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
  
  -- Total episodes (for series) or count of current episodes
  total_episodes INTEGER DEFAULT 0,
  
  -- Optional thumbnail image URL
  thumbnail_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- EPISODES TABLE
-- Individual content pieces within a rabbit hole
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Which rabbit hole this episode belongs to
  rabbit_hole_id UUID NOT NULL REFERENCES rabbit_holes(id) ON DELETE CASCADE,
  
  -- Episode number (1, 2, 3, etc.)
  episode_number INTEGER NOT NULL,
  
  -- Episode title
  title TEXT NOT NULL,
  
  -- Main AI-generated narrative content
  content TEXT NOT NULL,
  
  -- Content format type
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'interactive')),
  
  -- When this episode was published
  published_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Is this a news-triggered update episode?
  is_update BOOLEAN DEFAULT FALSE,
  
  -- Source URL if this came from news aggregation
  source_url TEXT,
  
  -- Brief summary for "previously on" sections
  summary TEXT,
  
  -- Unique constraint: only one episode N per rabbit hole
  UNIQUE(rabbit_hole_id, episode_number)
);

-- RABBIT_HOLE_TOPICS TABLE
-- Tags for categorization and discovery algorithm
CREATE TABLE rabbit_hole_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  rabbit_hole_id UUID NOT NULL REFERENCES rabbit_holes(id) ON DELETE CASCADE,
  
  -- Topic tag (e.g., "science", "tech", "history")
  topic TEXT NOT NULL,
  
  -- Unique constraint: no duplicate topics per rabbit hole
  UNIQUE(rabbit_hole_id, topic)
);

-- SUBSCRIPTIONS TABLE
-- Tracks what users follow and their progress
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User identifier (anonymous ID for now, will be auth.uid() later)
  user_id TEXT NOT NULL,
  
  -- Which rabbit hole they're subscribed to
  rabbit_hole_id UUID NOT NULL REFERENCES rabbit_holes(id) ON DELETE CASCADE,
  
  -- When they subscribed
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Last episode they've seen (for "unread" calculations)
  last_seen_episode INTEGER DEFAULT 0,
  
  -- Notification preferences
  notify_new_episodes BOOLEAN DEFAULT TRUE,
  
  -- Unique constraint: one subscription per user per rabbit hole
  UNIQUE(user_id, rabbit_hole_id)
);

-- USER_PROGRESS TABLE
-- Tracks which episodes users have read/completed
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User identifier
  user_id TEXT NOT NULL,
  
  -- Which episode they read
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  
  -- When they completed reading
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Reading time in seconds (for analytics)
  reading_time_seconds INTEGER,
  
  -- Unique constraint: one progress record per user per episode
  UNIQUE(user_id, episode_id)
);

-- SAVED_ITEMS TABLE
-- Saves episodes and rabbit holes
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User identifier
  user_id TEXT DEFAULT 'anonymous',
  
  -- Legacy: Wikipedia article ID (for backward compatibility)
  wikipedia_id TEXT,
  
  -- New: Episode ID (for rabbit hole content)
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  
  -- New: Rabbit hole ID (for quick rabbit hole saves)
  rabbit_hole_id UUID REFERENCES rabbit_holes(id) ON DELETE CASCADE,
  
  -- Display info
  title TEXT NOT NULL,
  extract TEXT,
  thumbnail_url TEXT,
  
  -- Timestamps
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- STEP 4: CREATE INDEXES
-- ==================================================

-- Rabbit holes indexes
CREATE INDEX idx_rabbit_holes_status ON rabbit_holes(status);
CREATE INDEX idx_rabbit_holes_type ON rabbit_holes(type);
CREATE INDEX idx_rabbit_holes_last_updated ON rabbit_holes(last_updated DESC);

-- Episodes indexes
CREATE INDEX idx_episodes_rabbit_hole ON episodes(rabbit_hole_id);
CREATE INDEX idx_episodes_published ON episodes(published_at DESC);

-- Topics indexes
CREATE INDEX idx_topics_topic ON rabbit_hole_topics(topic);
CREATE INDEX idx_topics_rabbit_hole ON rabbit_hole_topics(rabbit_hole_id);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_rabbit_hole ON subscriptions(rabbit_hole_id);

-- User progress indexes
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_episode ON user_progress(episode_id);

-- Saved items indexes
CREATE INDEX idx_saved_items_user ON saved_items(user_id);
CREATE INDEX idx_saved_items_wikipedia_id ON saved_items(wikipedia_id);
CREATE INDEX idx_saved_items_episode ON saved_items(episode_id);

-- ==================================================
-- STEP 5: ROW LEVEL SECURITY (RLS)
-- ==================================================

-- Enable RLS on all tables
ALTER TABLE rabbit_holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rabbit_hole_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read rabbit_holes" ON rabbit_holes;
DROP POLICY IF EXISTS "Allow public insert rabbit_holes" ON rabbit_holes;
DROP POLICY IF EXISTS "Allow public update rabbit_holes" ON rabbit_holes;
DROP POLICY IF EXISTS "Allow public read episodes" ON episodes;
DROP POLICY IF EXISTS "Allow public insert episodes" ON episodes;
DROP POLICY IF EXISTS "Allow public update episodes" ON episodes;
DROP POLICY IF EXISTS "Allow public read topics" ON rabbit_hole_topics;
DROP POLICY IF EXISTS "Allow public insert topics" ON rabbit_hole_topics;
DROP POLICY IF EXISTS "Allow public read subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow public insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow public delete subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow public update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow public read progress" ON user_progress;
DROP POLICY IF EXISTS "Allow public insert progress" ON user_progress;
DROP POLICY IF EXISTS "Allow public update progress" ON user_progress;
DROP POLICY IF EXISTS "Allow public read saved_items" ON saved_items;
DROP POLICY IF EXISTS "Allow public insert saved_items" ON saved_items;
DROP POLICY IF EXISTS "Allow public delete saved_items" ON saved_items;

-- Rabbit Holes: Public read, admin write
CREATE POLICY "Allow public read rabbit_holes" ON rabbit_holes 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert rabbit_holes" ON rabbit_holes 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update rabbit_holes" ON rabbit_holes 
  FOR UPDATE USING (true);

-- Episodes: Public read, admin write
CREATE POLICY "Allow public read episodes" ON episodes 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert episodes" ON episodes 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update episodes" ON episodes 
  FOR UPDATE USING (true);

-- Topics: Public read, admin write
CREATE POLICY "Allow public read topics" ON rabbit_hole_topics 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert topics" ON rabbit_hole_topics 
  FOR INSERT WITH CHECK (true);

-- Subscriptions: Public all
CREATE POLICY "Allow public read subscriptions" ON subscriptions 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert subscriptions" ON subscriptions 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete subscriptions" ON subscriptions 
  FOR DELETE USING (true);
CREATE POLICY "Allow public update subscriptions" ON subscriptions 
  FOR UPDATE USING (true);

-- User Progress: Public all
CREATE POLICY "Allow public read progress" ON user_progress 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert progress" ON user_progress 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update progress" ON user_progress 
  FOR UPDATE USING (true);

-- Saved Items: Public all
CREATE POLICY "Allow public read saved_items" ON saved_items 
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert saved_items" ON saved_items 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete saved_items" ON saved_items 
  FOR DELETE USING (true);

-- ==================================================
-- STEP 6: HELPER FUNCTIONS
-- ==================================================

-- Function to get unread episode count for a user's subscription
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id TEXT, p_rabbit_hole_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_seen INTEGER;
  total INTEGER;
BEGIN
  -- Get user's last seen episode
  SELECT COALESCE(last_seen_episode, 0) INTO last_seen
  FROM subscriptions
  WHERE user_id = p_user_id AND rabbit_hole_id = p_rabbit_hole_id;
  
  -- Get total episodes for this rabbit hole
  SELECT total_episodes INTO total
  FROM rabbit_holes
  WHERE id = p_rabbit_hole_id;
  
  RETURN GREATEST(0, COALESCE(total, 0) - COALESCE(last_seen, 0));
END;
$$ LANGUAGE plpgsql;

-- Function to update episode count when episodes are added/removed
CREATE OR REPLACE FUNCTION update_episode_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rabbit_holes
    SET total_episodes = (
      SELECT COUNT(*) FROM episodes WHERE rabbit_hole_id = NEW.rabbit_hole_id
    ),
    last_updated = NOW()
    WHERE id = NEW.rabbit_hole_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rabbit_holes
    SET total_episodes = (
      SELECT COUNT(*) FROM episodes WHERE rabbit_hole_id = OLD.rabbit_hole_id
    ),
    last_updated = NOW()
    WHERE id = OLD.rabbit_hole_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic episode count updates
CREATE TRIGGER episode_count_trigger
  AFTER INSERT OR DELETE ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_episode_count();

-- ==================================================
-- DONE!
-- ==================================================
-- Your rabbit hole system is now ready!
-- 
-- Next steps:
-- 1. Run: npm run seed (to populate with sample data)
-- 2. Refresh your app
-- ==================================================
