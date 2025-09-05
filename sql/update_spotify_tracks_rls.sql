-- Spotify tracks 테이블의 RLS 정책 업데이트
-- 익명 사용자도 읽을 수 있도록 설정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow read access for all users" ON public.spotify_tracks;
DROP POLICY IF EXISTS "Allow full access for service role" ON public.spotify_tracks;

-- 새로운 정책 생성
-- 1. 익명 사용자 및 인증된 사용자 모두 읽기 가능
CREATE POLICY "Enable read access for all users" ON public.spotify_tracks
  FOR SELECT USING (true);

-- 2. 서비스 역할은 모든 작업 가능 (삽입, 업데이트, 삭제)
CREATE POLICY "Enable full access for service role" ON public.spotify_tracks
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. 인증된 사용자는 읽기만 가능 (추가 보안)
CREATE POLICY "Enable read for authenticated users" ON public.spotify_tracks
  FOR SELECT 
  TO authenticated
  USING (true);

-- 4. anon 역할에게 명시적 읽기 권한 부여
CREATE POLICY "Enable read for anonymous users" ON public.spotify_tracks
  FOR SELECT 
  TO anon
  USING (true);