-- ==================================================
-- RESET AND CREATE SCHEMA
-- ==================================================
-- This script drops all existing tables and recreates them
-- Use this if you're getting column errors from old schema
-- ==================================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS saved_items CASCADE;
DROP TABLE IF EXISTS rabbit_hole_topics CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS rabbit_holes CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_unread_count(TEXT, UUID);
DROP FUNCTION IF EXISTS update_episode_count();

-- Drop existing triggers
DROP TRIGGER IF EXISTS episode_count_trigger ON episodes;

-- Now run the main schema.sql file after this
