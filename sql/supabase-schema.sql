-- Supabase schema: tables, indexes, triggers, functions (no RLS/policies)
-- Run this first in the Supabase SQL editor.

-- 0) Extensions (for UUID generation)
create extension if not exists pgcrypto;

-- 1) contents
create table if not exists contents (
  id text primary key,
  kind text not null,
  title text not null,
  original_title text,
  summary text not null,
  thumbnail_url text not null,
  backdrop_url text,

  size_mb integer not null,
  is_active boolean not null default true,

  -- TMDb / metadata
  tmdb_id bigint,
  tmdb_type text,
  release_date date,
  genre_ids jsonb,
  vote_average numeric(3,1),
  vote_count integer,
  popularity numeric,
  adult boolean,
  original_language text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Composite unique constraint for TMDb (allows same tmdb_id for movie and tv)
  constraint contents_tmdb_id_type_unique unique (tmdb_id, tmdb_type)
);

create index if not exists contents_active_idx on contents (is_active);
create index if not exists contents_kind_idx on contents (kind);
create index if not exists contents_popularity_idx on contents (popularity desc nulls last);
create index if not exists contents_created_idx on contents (created_at desc);
create index if not exists contents_tmdb_lookup_idx on contents (tmdb_id, tmdb_type);

-- 2) packs
create table if not exists packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  serial integer not null unique,
  share_slug text not null unique,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) pack_items (join table)
create table if not exists pack_items (
  pack_id uuid not null references packs(id) on delete cascade,
  content_id text not null references contents(id) on delete cascade,
  primary key (pack_id, content_id)
);

create index if not exists pack_items_pack_idx on pack_items (pack_id);
create index if not exists pack_items_content_idx on pack_items (content_id);

-- 4) messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references packs(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_pack_idx on messages (pack_id, created_at desc);

-- 5) counters
create table if not exists counters (
  key text primary key,
  value integer not null default 0
);

-- 6) spotify_tracks
create table if not exists spotify_tracks (
  id text primary key,
  name text not null,
  artist_names text[] not null,
  album_name text not null,
  album_image_url text,
  preview_url text,
  external_url text,
  duration_ms integer not null,
  popularity integer,
  release_date date,
  created_at timestamptz not null default now()
);

create index if not exists spotify_tracks_popularity_idx on spotify_tracks (popularity desc nulls last);
create index if not exists spotify_tracks_created_idx on spotify_tracks (created_at desc);

-- 7) share_events (tracking)
create table if not exists share_events (
  id bigint generated always as identity primary key,
  pack_slug text not null,
  platform text,
  created_at timestamptz not null default now()
);

create index if not exists share_events_slug_idx on share_events (pack_slug, created_at desc);

-- 8) pack_views (tracking)
create table if not exists pack_views (
  id bigint generated always as identity primary key,
  pack_slug text not null,
  created_at timestamptz not null default now()
);

create index if not exists pack_views_slug_idx on pack_views (pack_slug, created_at desc);

-- 9) updated_at trigger (shared)
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_contents_updated_at on contents;
create trigger trg_contents_updated_at
before update on contents
for each row execute function set_updated_at();

drop trigger if exists trg_packs_updated_at on packs;
create trigger trg_packs_updated_at
before update on packs
for each row execute function set_updated_at();

-- 10) increment_counter RPC function
create or replace function increment_counter(counter_key text)
returns integer
language plpgsql
as $$
declare
  new_val integer;
begin
  loop
    update counters
       set value = value + 1
     where key = counter_key
     returning value into new_val;
    if found then
      return new_val;
    end if;

    begin
      insert into counters(key, value) values (counter_key, 1)
      returning value into new_val;
      return new_val;
    exception when unique_violation then
      -- concurrency retry
    end;
  end loop;
end;
$$;

-- Optional: seed initial counter (uncomment if desired)
-- insert into counters(key, value) values ('pack_serial', 0)
--   on conflict (key) do nothing;

