'use server';

import spotifyClient, { type SpotifyTrack } from '@/utils/server/spotify-client'; // Import the default instance
import { createClient } from '@supabase/supabase-js';

// 직접 Supabase 클라이언트 생성 (TMDB 스크립트와 동일한 방식)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function syncSpotifyTracks(query: string, limit: number = 20) {
  if (!query.trim()) {
    return { success: false, message: '검색 쿼리가 비어 있습니다.' };
  }

  try {
    const spotifyTracks: SpotifyTrack[] = await spotifyClient.searchTracks(query, limit);

    if (spotifyTracks.length === 0) {
      return { success: true, message: '스포티파이에서 일치하는 트랙을 찾지 못했습니다.' };
    }

    const tracksToInsert = spotifyTracks.map(track => ({
      id: track.id,
      name: track.name,
      artist_names: track.artists.map(artist => artist.name),
      album_name: track.album.name,
      album_image_url: track.album.images[0]?.url || null,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      duration_ms: track.duration_ms,
      release_date: track.album.release_date || null, // null로 변환하여 날짜 오류 방지
      popularity: track.popularity,
    }));

    const supabaseAdmin = getSupabaseClient();
    const { data, error } = await supabaseAdmin
      .from('spotify_tracks')
      .upsert(tracksToInsert, { onConflict: 'id' }) // id 충돌 시 업데이트
      .select();

    if (error) {
      console.error('Supabase upsert error:', error);
      return { success: false, message: `Supabase 저장 중 오류 발생: ${error.message}` };
    }

    return { success: true, message: `${data?.length}개의 스포티파이 트랙이 성공적으로 동기화되었습니다.`, data };

  } catch (error: any) {
    console.error('Spotify sync failed:', error);
    return { success: false, message: `스포티파이 동기화 실패: ${error.message}` };
  }
}

// 인기 K-Pop 및 글로벌 트랙들을 검색으로 동기화
export async function syncPopularPlaylists() {
  const searchQueries = [
    // 최신 메가 히트곡들 (year 필터 제거)
    'BTS Dynamite',
    'BTS Butter', 
    'BTS Permission to Dance',
    'BLACKPINK How You Like That',
    'BLACKPINK DDU-DU DDU-DU',
    'NewJeans Ditto',
    'NewJeans Get Up',
    'aespa Next Level',
    'aespa Savage',
    'IVE LOVE DIVE',
    'IVE After LIKE',
    
    // 글로벌 K-Pop 히트
    'TWICE What Is Love',
    'TWICE Feel Special',
    'Stray Kids Gods Menu',
    'Stray Kids Back Door',
    'GIDLE TOMBOY',
    'GIDLE Queencard',
    'ITZY WANNABE',
    'ITZY Not Shy',
    'SEVENTEEN Left Right',
    'SEVENTEEN God of Music',
    
    // 4세대 아이돌 히트곡
    'Red Velvet Psycho',
    'Red Velvet Feel My Rhythm',
    'ENHYPEN Drunk-Dazed',
    'ENHYPEN Bite Me',
    'LE SSERAFIM FEARLESS',
    'LE SSERAFIM ANTIFRAGILE',
    'FIFTY FIFTY Cupid',
    
    // 최신 트렌드 및 바이럴 히트
    'Jungkook Seven',
    'Jungkook 3D',
    'LISA Money',
    'LISA LALISA',
    'IU Celebrity',
    'IU Through the Night',
    'TAEYEON Weekend',
    'Girls Generation FOREVER 1'
  ];

  try {
    console.log('🎵 인기 K-Pop & 글로벌 트랙 검색 중...');
    const allTracks: SpotifyTrack[] = [];
    const uniqueTrackIds = new Set<string>();

    for (const query of searchQueries) {
      console.log(`🔍 검색 중: "${query}"`);
      const tracks = await spotifyClient.searchTracks(query, 20);
      
      // 중복 제거하며 추가
      for (const track of tracks) {
        if (!uniqueTrackIds.has(track.id)) {
          uniqueTrackIds.add(track.id);
          allTracks.push(track);
        }
      }
      
      console.log(`   📊 현재까지 ${allTracks.length}개 고유 트랙 수집`);
    }

    const spotifyTracks = allTracks;

    if (spotifyTracks.length === 0) {
      return { success: true, message: '플레이리스트에서 트랙을 찾지 못했습니다.' };
    }

    console.log(`📀 총 ${spotifyTracks.length}개의 고유 트랙 발견`);

    // 날짜 형식 처리 함수
    const formatReleaseDate = (dateStr: string | null): string | null => {
      if (!dateStr) return null;
      
      // "2005" -> "2005-01-01"
      if (/^\d{4}$/.test(dateStr)) {
        return `${dateStr}-01-01`;
      }
      
      // "2005-03" -> "2005-03-01"  
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return `${dateStr}-01`;
      }
      
      // "2005-03-15" -> 그대로 유지
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // 기타 형식은 null로
      return null;
    };

    const tracksToInsert = spotifyTracks.map(track => ({
      id: track.id,
      name: track.name,
      artist_names: track.artists.map(artist => artist.name),
      album_name: track.album.name,
      album_image_url: track.album.images[0]?.url || null,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      duration_ms: track.duration_ms,
      release_date: formatReleaseDate(track.album.release_date), // 날짜 형식 변환
      popularity: track.popularity,
    }));

    const supabaseAdmin = getSupabaseClient();
    
    // 기존 데이터 삭제 후 새 데이터 삽입 (TMDB와 동일한 방식)
    console.log('🗑️ 기존 Spotify 트랙 데이터 삭제 중...');
    const { error: deleteError } = await supabaseAdmin
      .from('spotify_tracks')
      .delete()
      .gte('created_at', '1970-01-01'); // 모든 데이터 삭제

    if (deleteError) {
      console.error('기존 데이터 삭제 오류:', deleteError);
      return { success: false, message: `기존 데이터 삭제 중 오류 발생: ${deleteError.message}` };
    }

    console.log('💾 새로운 트랙 데이터 삽입 중...');
    const { data, error } = await supabaseAdmin
      .from('spotify_tracks')
      .insert(tracksToInsert)
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, message: `Supabase 저장 중 오류 발생: ${error.message}` };
    }

    return { 
      success: true, 
      message: `✅ 성공! ${data?.length}개의 인기 스포티파이 트랙이 동기화되었습니다.`,
      data: {
        totalTracks: data?.length,
        searches: searchQueries.length
      }
    };

  } catch (error: any) {
    console.error('Popular playlists sync failed:', error);
    return { success: false, message: `인기 플레이리스트 동기화 실패: ${error.message}` };
  }
}
