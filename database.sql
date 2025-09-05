-- 희망의 씨앗 캠페인 데이터베이스 스키마

-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 콘텐츠 테이블 (TMDB 메타데이터 포함)
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kind TEXT NOT NULL CHECK (kind IN ('movie', 'drama', 'show', 'kpop', 'doc')),
    title TEXT NOT NULL,
    original_title TEXT, -- TMDB 원제목
    summary TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    backdrop_url TEXT, -- TMDB 배경 이미지
    size_mb INTEGER NOT NULL CHECK (size_mb > 0),
    is_active BOOLEAN DEFAULT true,
    tmdb_id INTEGER, -- TMDB API ID
    tmdb_type TEXT CHECK (tmdb_type IN ('movie', 'tv')), -- TMDB 타입
    release_date DATE, -- 출시일
    genre_ids INTEGER[], -- TMDB 장르 ID 배열
    vote_average DECIMAL(3,1), -- TMDB 평점 (0.0-10.0)
    vote_count INTEGER, -- TMDB 투표 수
    popularity DECIMAL(10,3), -- TMDB 인기도
    adult BOOLEAN DEFAULT false, -- 성인 콘텐츠 여부
    original_language TEXT, -- 원본 언어 코드
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 미디어팩 테이블
CREATE TABLE packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (length(name) <= 20),
    message TEXT NOT NULL CHECK (length(message) <= 50),
    serial BIGINT UNIQUE NOT NULL,
    share_slug TEXT UNIQUE NOT NULL,
    og_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 미디어팩-콘텐츠 관계 테이블
CREATE TABLE pack_items (
    pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    PRIMARY KEY (pack_id, content_id)
);

-- 메시지 테이블 (확장용)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 카운터 테이블 (시퀀스 관리)
CREATE TABLE counters (
    key TEXT PRIMARY KEY,
    value BIGINT NOT NULL DEFAULT 0
);

-- 초기 카운터 설정
INSERT INTO counters (key, value) VALUES ('pack_serial', 0);

-- 시퀀스 증가 함수
CREATE OR REPLACE FUNCTION increment_counter(counter_key TEXT)
RETURNS BIGINT AS $
DECLARE
    new_value BIGINT;
BEGIN
    INSERT INTO counters (key, value) VALUES (counter_key, 1)
    ON CONFLICT (key) 
    DO UPDATE SET value = counters.value + 1
    RETURNING value INTO new_value;
    
    RETURN new_value;
END;
$ LANGUAGE plpgsql;

-- RLS 정책 설정

-- Contents: 공개 읽기, 관리자만 쓰기
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active contents" ON contents
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage contents" ON contents
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Packs: 공개 읽기 (share_slug 기반), 누구나 생성
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read packs by slug" ON packs
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create packs" ON packs
    FOR INSERT WITH CHECK (true);

-- Pack Items: 관련 pack과 동일한 정책
ALTER TABLE pack_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pack items" ON pack_items
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create pack items" ON pack_items
    FOR INSERT WITH CHECK (true);

-- Messages: 관련 pack과 동일한 정책
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create messages" ON messages
    FOR INSERT WITH CHECK (true);

-- Counters: 공개 읽기, 함수를 통한 업데이트만
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read counters" ON counters
    FOR SELECT USING (true);

-- 샘플 콘텐츠 데이터
INSERT INTO contents (kind, title, summary, thumbnail_url, size_mb) VALUES 
('movie', '기생충', '봉준호 감독의 아카데미 작품상 수상작', 'https://via.placeholder.com/300x400?text=기생충', 4500),
('movie', '미나리', '따뜻한 가족 이야기를 그린 감동작', 'https://via.placeholder.com/300x400?text=미나리', 3800),
('drama', '오징어 게임', '전 세계를 열광시킨 넷플릭스 오리지널', 'https://via.placeholder.com/300x400?text=오징어게임', 12000),
('drama', '사랑의 불시착', '북한과 남한을 배경으로 한 로맨스', 'https://via.placeholder.com/300x400?text=사랑의불시착', 15600),
('show', '유 퀴즈 온 더 블럭', '유재석과 조세호의 토크쇼', 'https://via.placeholder.com/300x400?text=유퀴즈', 2800),
('show', '런닝맨', '웃음과 재미가 가득한 예능', 'https://via.placeholder.com/300x400?text=런닝맨', 3200),
('kpop', 'BTS - Dynamite', '전 세계를 사로잡은 히트곡', 'https://via.placeholder.com/300x400?text=BTS', 150),
('kpop', 'NewJeans - Get Up', '4세대 아이돌의 대표곡', 'https://via.placeholder.com/300x400?text=NewJeans', 120),
('doc', '나의 아름다운 정원', '자연과 함께하는 힐링 다큐', 'https://via.placeholder.com/300x400?text=나의아름다운정원', 5200),
('doc', '한국사 탐험', '우리 역사를 재조명하는 교양 프로그램', 'https://via.placeholder.com/300x400?text=한국사탐험', 6800);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_contents_kind ON contents(kind);
CREATE INDEX idx_contents_is_active ON contents(is_active);
CREATE INDEX idx_contents_tmdb_id ON contents(tmdb_id);
CREATE INDEX idx_contents_tmdb_type ON contents(tmdb_type);
CREATE INDEX idx_contents_popularity ON contents(popularity DESC);
CREATE INDEX idx_contents_vote_average ON contents(vote_average DESC);
CREATE INDEX idx_contents_release_date ON contents(release_date DESC);
CREATE INDEX idx_contents_genre_ids ON contents USING GIN(genre_ids);
CREATE INDEX idx_packs_share_slug ON packs(share_slug);
CREATE INDEX idx_packs_serial ON packs(serial);
CREATE INDEX idx_pack_items_pack_id ON pack_items(pack_id);
CREATE INDEX idx_messages_pack_id ON messages(pack_id);

COMMENT ON TABLE contents IS '미디어 콘텐츠 마스터 테이블';
COMMENT ON TABLE packs IS '사용자가 생성한 미디어팩 테이블';
COMMENT ON TABLE pack_items IS '미디어팩과 콘텐츠의 다대다 관계 테이블';
COMMENT ON TABLE messages IS '미디어팩에 대한 추가 메시지 테이블';
COMMENT ON TABLE counters IS '시퀀스 및 카운터 관리 테이블';

-- spotify_tracks table
CREATE TABLE spotify_tracks (
    id TEXT PRIMARY KEY, -- Spotify track ID
    name TEXT NOT NULL,
    artist_names TEXT[] NOT NULL, -- Array of artist names
    album_name TEXT NOT NULL,
    album_image_url TEXT,
    preview_url TEXT,
    external_url TEXT NOT NULL, -- Link to Spotify
    duration_ms INTEGER,
    release_date DATE,
    popularity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add indexes for common queries
CREATE INDEX idx_spotify_tracks_name ON spotify_tracks (name);
CREATE INDEX idx_spotify_tracks_artist_names ON spotify_tracks USING GIN (artist_names);

-- RLS Policy for spotify_tracks: Public can read
ALTER TABLE spotify_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read spotify_tracks" ON spotify_tracks
    FOR SELECT USING (true);

COMMENT ON TABLE spotify_tracks IS 'Spotify track metadata table';