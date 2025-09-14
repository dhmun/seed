-- 희망의 씨앗 캠페인 Supabase 스키마
-- SQLite 구조를 PostgreSQL로 변환

-- 1. 콘텐츠 테이블 (영화, 드라마, 쇼, K-POP, 다큐멘터리)
CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('movie', 'drama', 'show', 'kpop', 'doc')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  size_mb REAL NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- TMDB 메타데이터
  tmdb_id INTEGER,
  vote_average REAL,
  release_date DATE,
  genre_ids JSONB,
  popularity REAL,
  original_title TEXT,
  backdrop_url TEXT,
  tmdb_type TEXT,
  vote_count INTEGER,
  adult BOOLEAN DEFAULT false,
  original_language TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 미디어팩 테이블
CREATE TABLE IF NOT EXISTS packs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  serial INTEGER NOT NULL,
  share_slug TEXT NOT NULL UNIQUE,
  og_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 미디어팩-콘텐츠 연결 테이블
CREATE TABLE IF NOT EXISTS pack_items (
  pack_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  PRIMARY KEY (pack_id, content_id),
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- 4. 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pack_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
);

-- 5. 카운터 테이블 (시리얼 번호 등)
CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

-- 6. 공유 이벤트 추적 테이블
CREATE TABLE IF NOT EXISTS share_events (
  id BIGSERIAL PRIMARY KEY,
  pack_slug TEXT NOT NULL,
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 미디어팩 조회 추적 테이블
CREATE TABLE IF NOT EXISTS pack_views (
  id BIGSERIAL PRIMARY KEY,
  pack_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Spotify 트랙 정보 테이블 (기존에 있었던 것으로 보임)
CREATE TABLE IF NOT EXISTS spotify_tracks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  artist_names TEXT[] NOT NULL,
  album_name TEXT NOT NULL,
  album_image_url TEXT,
  preview_url TEXT,
  external_urls JSONB,
  popularity INTEGER,
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_contents_kind ON contents(kind);
CREATE INDEX IF NOT EXISTS idx_contents_is_active ON contents(is_active);
CREATE INDEX IF NOT EXISTS idx_contents_popularity ON contents(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_tmdb_id ON contents(tmdb_id);

CREATE INDEX IF NOT EXISTS idx_packs_share_slug ON packs(share_slug);
CREATE INDEX IF NOT EXISTS idx_packs_serial ON packs(serial);
CREATE INDEX IF NOT EXISTS idx_packs_created_at ON packs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pack_items_pack_id ON pack_items(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_items_content_id ON pack_items(content_id);

CREATE INDEX IF NOT EXISTS idx_share_events_pack_slug ON share_events(pack_slug);
CREATE INDEX IF NOT EXISTS idx_share_events_created_at ON share_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pack_views_pack_slug ON pack_views(pack_slug);
CREATE INDEX IF NOT EXISTS idx_pack_views_created_at ON pack_views(created_at DESC);

-- 초기 데이터 삽입
-- 카운터 초기화 (미디어팩 시리얼 번호)
INSERT INTO counters (key, value) VALUES ('pack_serial', 0) ON CONFLICT (key) DO NOTHING;

-- RLS (Row Level Security) 비활성화 - 공개 애플리케이션
ALTER TABLE contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE packs DISABLE ROW LEVEL SECURITY;
ALTER TABLE pack_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE counters DISABLE ROW LEVEL SECURITY;
ALTER TABLE share_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE pack_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_tracks DISABLE ROW LEVEL SECURITY;

-- increment_counter 함수 생성 (시리얼 번호 자동 증가용)
CREATE OR REPLACE FUNCTION increment_counter(counter_key TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_value INTEGER;
BEGIN
  UPDATE counters 
  SET value = value + 1 
  WHERE key = counter_key
  RETURNING value INTO new_value;
  
  IF NOT FOUND THEN
    INSERT INTO counters (key, value) VALUES (counter_key, 1)
    RETURNING value INTO new_value;
  END IF;
  
  RETURN new_value;
END;
$$;