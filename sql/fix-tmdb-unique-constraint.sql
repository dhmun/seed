-- Fix TMDb unique constraint to allow same tmdb_id for movies and TV shows
-- Run this in Supabase SQL Editor

-- 1. Drop the existing unique constraint on tmdb_id
ALTER TABLE contents DROP CONSTRAINT IF EXISTS contents_tmdb_id_key;

-- 2. Add a composite unique constraint on (tmdb_id, tmdb_type)
-- This allows the same tmdb_id for different types (movie vs tv)
ALTER TABLE contents ADD CONSTRAINT contents_tmdb_id_type_unique
  UNIQUE (tmdb_id, tmdb_type);

-- 3. Add index for better query performance
CREATE INDEX IF NOT EXISTS contents_tmdb_lookup_idx
  ON contents (tmdb_id, tmdb_type);
