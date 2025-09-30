'use server';

import spotifyClient, { type SpotifyTrack } from '@/utils/server/spotify-client';

// Supabase is removed. The functions in this file are now stubs.

export async function syncSpotifyTracks(query: string, limit: number = 20) {
  if (!query.trim()) {
    return { success: false, message: '검색 쿼리가 비어 있습니다.' };
  }

  try {
    const spotifyTracks: SpotifyTrack[] = await spotifyClient.searchTracks(query, limit);

    if (spotifyTracks.length === 0) {
      return { success: true, message: '스포티파이에서 일치하는 트랙을 찾지 못했습니다.' };
    }
    
    const message = `${spotifyTracks.length}개의 스포티파이 트랙을 찾았지만, 데이터베이스가 비활성화되어 저장하지 않았습니다.`;
    console.log(message);
    return { success: true, message };

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

    const message = `✅ 성공! ${spotifyTracks.length}개의 인기 스포티파이 트랙을 찾았지만, 데이터베이스가 비활성화되어 저장하지 않았습니다.`;
    console.log(message);

    return { 
      success: true, 
      message,
      data: {
        totalTracks: spotifyTracks.length,
        searches: searchQueries.length
      }
    };

  } catch (error: any) {
    console.error('Popular playlists sync failed:', error);
    return { success: false, message: `인기 플레이리스트 동기화 실패: ${error.message}` };
  }
}