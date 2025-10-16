-- Add spotify_track_id column to pack_items table
-- This allows packs to contain both TMDb content and Spotify tracks

-- 1. Drop existing primary key first (required before making content_id nullable)
ALTER TABLE pack_items DROP CONSTRAINT IF EXISTS pack_items_pkey;

-- 2. Add id column as new primary key
ALTER TABLE pack_items ADD COLUMN IF NOT EXISTS id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY;

-- 3. Add spotify_track_id column (nullable)
ALTER TABLE pack_items
ADD COLUMN IF NOT EXISTS spotify_track_id text REFERENCES spotify_tracks(id) ON DELETE CASCADE;

-- 4. Make content_id nullable (since we can have either content_id OR spotify_track_id)
ALTER TABLE pack_items
ALTER COLUMN content_id DROP NOT NULL;

-- 5. Add CHECK constraint to ensure at least one ID is present
ALTER TABLE pack_items
ADD CONSTRAINT pack_items_check_one_id
CHECK (
  (content_id IS NOT NULL AND spotify_track_id IS NULL) OR
  (content_id IS NULL AND spotify_track_id IS NOT NULL)
);

-- 6. Add index for spotify_track_id lookups
CREATE INDEX IF NOT EXISTS pack_items_spotify_track_idx ON pack_items (spotify_track_id);

-- Add unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS pack_items_content_unique
  ON pack_items (pack_id, content_id)
  WHERE content_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pack_items_spotify_unique
  ON pack_items (pack_id, spotify_track_id)
  WHERE spotify_track_id IS NOT NULL;
