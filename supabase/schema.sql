-- ==================================================
-- iSCROLL DATABASE SCHEMA
-- ==================================================
-- 
-- HOW TO USE THIS FILE:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" (or press Cmd+Enter / Ctrl+Enter)
-- 
-- This will create all the tables your app needs.
-- ==================================================

-- Enable UUID extension (for generating unique IDs)
-- UUIDs are like super-unique IDs that won't conflict even across different databases
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- SAVED_ITEMS TABLE
-- ==================================================
-- Stores articles that users have bookmarked
-- 
-- Columns:
-- - id: Unique identifier (auto-generated)
-- - wikipedia_id: The article's ID from Wikipedia
-- - title: Article title for display
-- - extract: Short description/summary
-- - thumbnail_url: URL to the article's image
-- - saved_at: When it was bookmarked

CREATE TABLE IF NOT EXISTS saved_items (
  -- Primary key: unique identifier for each saved item
  -- uuid_generate_v4() creates a random unique ID automatically
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Wikipedia article identifier
  -- NOT NULL means this field is required
  wikipedia_id TEXT NOT NULL,
  
  -- Article title (required for display)
  title TEXT NOT NULL,
  
  -- Short description (optional)
  extract TEXT,
  
  -- Thumbnail image URL (optional)
  thumbnail_url TEXT,
  
  -- When was this saved? Defaults to current time
  -- TIMESTAMPTZ includes timezone information
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- INDEX FOR FASTER QUERIES
-- ==================================================
-- An index is like a book's index - it helps find things faster
-- We'll often query by wikipedia_id, so index it

CREATE INDEX IF NOT EXISTS idx_saved_items_wikipedia_id 
ON saved_items(wikipedia_id);

-- ==================================================
-- ROW LEVEL SECURITY (RLS)
-- ==================================================
-- For now, we allow all operations without authentication
-- In v0.2+, you'll add user-specific permissions

-- Enable RLS on the table (required for Supabase)
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read saved items
CREATE POLICY "Allow public read access" 
ON saved_items FOR SELECT 
USING (true);

-- Policy: Allow anyone to insert saved items
CREATE POLICY "Allow public insert access" 
ON saved_items FOR INSERT 
WITH CHECK (true);

-- Policy: Allow anyone to delete saved items
CREATE POLICY "Allow public delete access" 
ON saved_items FOR DELETE 
USING (true);

-- ==================================================
-- DONE!
-- ==================================================
-- Your table is now ready. The app can:
-- - Save articles (INSERT)
-- - List saved articles (SELECT)
-- - Remove saved articles (DELETE)
-- 
-- In future versions, we'll add:
-- - user_id column (to separate each user's saves)
-- - Authentication requirements
-- ==================================================
