-- Supabase RLS + policies (run after supabase-schema.sql)

-- Enable RLS on all relevant tables
alter table contents       enable row level security;
alter table packs          enable row level security;
alter table pack_items     enable row level security;
alter table messages       enable row level security;
alter table counters       enable row level security;
alter table spotify_tracks enable row level security;
alter table share_events   enable row level security;
alter table pack_views     enable row level security;

-- Minimal policies
do $$
begin
  -- Public read policies (adjust to your needs)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='contents' and policyname='contents_read_all'
  ) then
    create policy contents_read_all on contents for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='packs' and policyname='packs_read_all'
  ) then
    create policy packs_read_all on packs for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='pack_items' and policyname='pack_items_read_all'
  ) then
    create policy pack_items_read_all on pack_items for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='spotify_tracks' and policyname='spotify_tracks_read_all'
  ) then
    create policy spotify_tracks_read_all on spotify_tracks for select using (true);
  end if;

  -- Allow inserts for tracking tables
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='share_events' and policyname='share_events_insert_all'
  ) then
    create policy share_events_insert_all on share_events for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='pack_views' and policyname='pack_views_insert_all'
  ) then
    create policy pack_views_insert_all on pack_views for insert with check (true);
  end if;
end $$;

-- Optional seed (uncomment if you want an initial counter)
-- insert into counters(key, value) values ('pack_serial', 0)
--   on conflict (key) do nothing;

