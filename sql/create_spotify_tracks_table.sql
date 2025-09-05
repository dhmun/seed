-- Spotify 트랙 정보를 저장하는 테이블 생성
CREATE TABLE IF NOT EXISTS public.spotify_tracks (
  id TEXT PRIMARY KEY,                    -- Spotify Track ID
  name TEXT NOT NULL,                     -- 트랙 이름
  artist_names TEXT[] NOT NULL,           -- 아티스트 이름 배열
  album_name TEXT NOT NULL,               -- 앨범 이름
  album_image_url TEXT,                   -- 앨범 이미지 URL
  preview_url TEXT,                       -- 미리듣기 URL (30초)
  external_url TEXT NOT NULL,             -- Spotify 링크
  duration_ms INTEGER,                    -- 재생 시간 (밀리초)
  release_date TEXT,                      -- 발매일 (TEXT 형식으로 저장)
  popularity INTEGER,                     -- 인기도 (0-100)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- 생성 시간
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_spotify_tracks_name ON public.spotify_tracks (name);
CREATE INDEX IF NOT EXISTS idx_spotify_tracks_artist_names ON public.spotify_tracks USING GIN (artist_names);
CREATE INDEX IF NOT EXISTS idx_spotify_tracks_album_name ON public.spotify_tracks (album_name);
CREATE INDEX IF NOT EXISTS idx_spotify_tracks_popularity ON public.spotify_tracks (popularity DESC);

-- Row Level Security (RLS) 설정
ALTER TABLE public.spotify_tracks ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Allow read access for all users" ON public.spotify_tracks
  FOR SELECT USING (true);

-- 서비스 역할만 삽입/업데이트/삭제 가능
CREATE POLICY "Allow full access for service role" ON public.spotify_tracks
  FOR ALL USING (auth.role() = 'service_role');