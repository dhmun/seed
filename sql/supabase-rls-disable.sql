-- Disable Row Level Security (public app)
-- Run this after running supabase-schema.sql

alter table contents       disable row level security;
alter table packs          disable row level security;
alter table pack_items     disable row level security;
alter table messages       disable row level security;
alter table counters       disable row level security;
alter table spotify_tracks disable row level security;
alter table share_events   disable row level security;
alter table pack_views     disable row level security;

-- Note: Existing policies (if any) are ignored while RLS is disabled.
-- You can drop them later if you want to keep the schema tidy.

