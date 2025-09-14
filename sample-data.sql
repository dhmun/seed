-- 희망의 씨앗 캠페인 샘플 데이터
-- 스키마 생성 후 실행해 주세요

-- 영화 콘텐츠 샘플 데이터
INSERT INTO contents (id, kind, title, summary, thumbnail_url, size_mb, is_active, tmdb_id, vote_average, release_date, popularity) VALUES 
('movie_parasite', 'movie', '기생충', '봉준호 감독의 아카데미 작품상 수상작', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 4500, true, 496243, 8.5, '2019-05-30', 95.2),
('movie_minari', 'movie', '미나리', '미국으로 이민 온 한국 가족의 따뜻한 이야기', 'https://image.tmdb.org/t/p/w500/decLNVpas4TDPtamDmfYGeB1hYM.jpg', 3800, true, 678692, 7.4, '2020-12-11', 78.5),
('movie_decision', 'movie', '결정을 내리다', '선택의 기로에 선 사람들의 이야기', 'https://via.placeholder.com/500x750/3B82F6/ffffff?text=결정을내리다', 4200, true, null, 7.8, '2023-06-15', 65.3),
('movie_burning', 'movie', '버닝', '이창동 감독의 칸 영화제 출품작', 'https://image.tmdb.org/t/p/w500/2bSm6vaeG8BxEP2MKe1PfWQGo5A.jpg', 5100, true, 468969, 7.5, '2018-05-17', 82.1),
('movie_oldboy', 'movie', '올드보이', '박찬욱 감독의 복수 삼부작', 'https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qx7O.jpg', 6200, true, 670292, 8.4, '2003-11-21', 91.7);

-- 드라마 콘텐츠 샘플 데이터  
INSERT INTO contents (id, kind, title, summary, thumbnail_url, size_mb, is_active, tmdb_id, vote_average, release_date, popularity) VALUES
('drama_squid', 'drama', '오징어 게임', '전 세계를 열광시킨 넷플릭스 오리지널', 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', 12000, true, 93405, 8.0, '2021-09-17', 98.5),
('drama_crash_landing', 'drama', '사랑의 불시착', '북남 배경의 감동적인 로맨스', 'https://image.tmdb.org/t/p/w500/53P9lBek0yNa2y3TC2S4dkokIQA.jpg', 15600, true, 83097, 8.7, '2019-12-14', 87.3),
('drama_kingdom', 'drama', '킹덤', '조선시대 좀비 스릴러', 'https://image.tmdb.org/t/p/w500/eSh8OxLLhM7jKVbfWV8JlACJrK6.jpg', 14200, true, 72879, 8.3, '2019-01-25', 79.8),
('drama_sky_castle', 'drama', 'SKY 캐슬', '상류층 교육 현실을 그린 드라마', 'https://image.tmdb.org/t/p/w500/21NwQpVFBr1FCd7UDLh7bGOb2bR.jpg', 18900, true, null, 8.9, '2018-11-23', 88.4),
('drama_reply1988', 'drama', '응답하라 1988', '1988년 쌍문동의 따뜻한 이야기', 'https://image.tmdb.org/t/p/w500/lf8YjgcYMCiF2WNdEJZvzKaR2Dm.jpg', 16700, true, null, 9.1, '2015-11-06', 92.6);

-- 쇼/예능 콘텐츠 샘플 데이터
INSERT INTO contents (id, kind, title, summary, thumbnail_url, size_mb, is_active, popularity) VALUES
('show_running_man', 'show', '런닝맨', '대한민국 대표 예능 프로그램', 'https://via.placeholder.com/500x750/F59E0B/ffffff?text=런닝맨', 8500, true, 85.2),
('show_knowing_bros', 'show', '아는 형님', '토크쇼와 예능이 결합된 프로그램', 'https://via.placeholder.com/500x750/EF4444/ffffff?text=아는형님', 7800, true, 78.9),
('show_yoo_quiz', 'show', '유 퀴즈 온 더 블럭', '유재석과 조세호의 토크쇼', 'https://via.placeholder.com/500x750/8B5CF6/ffffff?text=유퀴즈', 6900, true, 91.3),
('show_masked_singer', 'show', '복면가왕', '정체를 숨긴 가수들의 경연', 'https://via.placeholder.com/500x750/F97316/ffffff?text=복면가왕', 9200, true, 82.7),
('show_infinite_challenge', 'show', '무한도전', '전설적인 예능 프로그램', 'https://via.placeholder.com/500x750/10B981/ffffff?text=무한도전', 11000, true, 95.8);

-- K-POP 콘텐츠 샘플 데이터
INSERT INTO contents (id, kind, title, summary, thumbnail_url, size_mb, is_active, popularity) VALUES
('kpop_bts_dynamite', 'kpop', 'BTS - Dynamite', 'BTS의 글로벌 히트곡', 'https://via.placeholder.com/500x750/EC4899/ffffff?text=BTS+Dynamite', 5, true, 99.1),
('kpop_newjeans_get_up', 'kpop', 'NewJeans - Get Up', 'NewJeans의 대표곡', 'https://via.placeholder.com/500x750/06B6D4/ffffff?text=NewJeans', 5, true, 94.7),
('kpop_ive_love_dive', 'kpop', 'IVE - LOVE DIVE', 'IVE의 인기곡', 'https://via.placeholder.com/500x750/A855F7/ffffff?text=IVE', 5, true, 89.3),
('kpop_aespa_spicy', 'kpop', 'aespa - Spicy', 'aespa의 최신 타이틀곡', 'https://via.placeholder.com/500x750/F59E0B/ffffff?text=aespa', 5, true, 87.9),
('kpop_seventeen_god_of_music', 'kpop', 'SEVENTEEN - God of Music', 'SEVENTEEN의 역동적인 퍼포먼스', 'https://via.placeholder.com/500x750/EF4444/ffffff?text=SEVENTEEN', 5, true, 92.4);

-- 다큐멘터리 콘텐츠 샘플 데이터
INSERT INTO contents (id, kind, title, summary, thumbnail_url, size_mb, is_active, popularity) VALUES
('doc_my_beautiful_garden', 'doc', '나의 아름다운 정원', '한국의 전통 정원을 탐방하는 다큐멘터리', 'https://via.placeholder.com/500x750/16A34A/ffffff?text=나의아름다운정원', 7800, true, 76.2),
('doc_korean_history', 'doc', '한국사 탐험', '우리나라 역사의 숨겨진 이야기들', 'https://via.placeholder.com/500x750/B45309/ffffff?text=한국사탐험', 9500, true, 82.1),
('doc_nature_sound', 'doc', '자연의 소리', '한국의 자연 속에서 들리는 소리들', 'https://via.placeholder.com/500x750/059669/ffffff?text=자연의소리', 6700, true, 71.8),
('doc_traditional_craft', 'doc', '전통 공예의 미', '장인 정신이 담긴 우리의 전통 공예', 'https://via.placeholder.com/500x750/7C2D12/ffffff?text=전통공예의미', 8200, true, 79.4),
('doc_korean_food', 'doc', '한식의 세계', '세계로 뻗어나가는 한국 음식 문화', 'https://via.placeholder.com/500x750/DC2626/ffffff?text=한식의세계', 8900, true, 85.6);

-- 초기 카운터 설정 (이미 스키마에 있지만 확인차)
INSERT INTO counters (key, value) VALUES ('pack_serial', 0) ON CONFLICT (key) DO NOTHING;