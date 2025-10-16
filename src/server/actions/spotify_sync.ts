'use server';

import spotifyClient, { type SpotifyTrack } from '@/utils/server/spotify-client';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

// Create Supabase admin client directly
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('[ERROR] Missing Supabase credentials:');
    console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.error('  SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? 'SET' : 'MISSING');
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceKey);
}

export async function syncSpotifyTracks(query: string, limit: number = 20) {
  if (!query.trim()) {
    return { success: false, message: '검색 쿼리가 비어 있습니다.' };
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return { success: false, message: 'Supabase 관리자 클라이언트가 설정되지 않았습니다.' };
  }

  try {
    const spotifyTracks: SpotifyTrack[] = await spotifyClient.searchTracks(query, limit);

    if (spotifyTracks.length === 0) {
      return { success: true, message: '스포티파이에서 일치하는 트랙을 찾지 못했습니다.' };
    }

    // Transform Spotify tracks to database format
    const dbTracks = spotifyTracks.map(track => {
      // Fix release_date format - Spotify sometimes returns just year ("2001")
      let releaseDate = track.album.release_date;
      if (releaseDate) {
        if (releaseDate.startsWith('0000')) {
          // Invalid date like "0000-01-01" - set to null
          releaseDate = null;
        } else if (releaseDate.length === 4) {
          // Year only - convert to YYYY-01-01
          releaseDate = `${releaseDate}-01-01`;
        } else if (releaseDate.length === 7) {
          // YYYY-MM format - convert to YYYY-MM-01
          releaseDate = `${releaseDate}-01`;
        }
      }

      return {
        id: track.id,
        name: track.name,
        artist_names: track.artists.map(a => a.name),
        album_name: track.album.name,
        album_image_url: track.album.images[0]?.url || null,
        preview_url: track.preview_url || null,
        external_url: track.external_urls.spotify,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        release_date: releaseDate || null,
      };
    });

    // Upsert to database (insert or update on conflict)
    const { error } = await supabaseAdmin
      .from('spotify_tracks')
      .upsert(dbTracks, { onConflict: 'id' });

    if (error) throw error;

    const message = `✅ ${spotifyTracks.length}개의 스포티파이 트랙을 데이터베이스에 저장했습니다.`;
    console.log(message);
    return { success: true, message, data: { totalTracks: spotifyTracks.length } };

  } catch (error: any) {
    console.error('Spotify sync failed:', error);
    return { success: false, message: `스포티파이 동기화 실패: ${error.message}` };
  }
}

// 인기 K-Pop 및 글로벌 트랙들을 검색으로 동기화
export async function syncPopularPlaylists() {
  const searchQueries = [
    // BTS 메가 히트
    'BTS Dynamite',
    'BTS Butter',
    'BTS Permission to Dance',
    'BTS Spring Day',
    'BTS Blood Sweat Tears',
    'BTS IDOL',
    'BTS DNA',
    'BTS Boy With Luv',

    // BLACKPINK 글로벌 히트
    'BLACKPINK How You Like That',
    'BLACKPINK DDU-DU DDU-DU',
    'BLACKPINK Kill This Love',
    'BLACKPINK Pink Venom',
    'BLACKPINK Shut Down',
    'BLACKPINK As If Its Your Last',

    // NewJeans 최신 히트
    'NewJeans Ditto',
    'NewJeans OMG',
    'NewJeans Hype Boy',
    'NewJeans Attention',
    'NewJeans Super Shy',
    'NewJeans ETA',

    // aespa 인기곡
    'aespa Next Level',
    'aespa Savage',
    'aespa Black Mamba',
    'aespa Spicy',
    'aespa Drama',

    // IVE 히트곡
    'IVE LOVE DIVE',
    'IVE After LIKE',
    'IVE Kitsch',
    'IVE I AM',
    'IVE Baddie',

    // TWICE 글로벌 히트
    'TWICE What Is Love',
    'TWICE Feel Special',
    'TWICE Fancy',
    'TWICE TT',
    'TWICE Cheer Up',
    'TWICE The Feels',
    'TWICE SET ME FREE',

    // Stray Kids
    'Stray Kids Gods Menu',
    'Stray Kids Back Door',
    'Stray Kids MANIAC',
    'Stray Kids Thunderous',
    'Stray Kids S-Class',

    // (G)I-DLE
    'GIDLE TOMBOY',
    'GIDLE Queencard',
    'GIDLE Nxde',
    'GIDLE Oh my god',
    'GIDLE LATATA',

    // ITZY
    'ITZY WANNABE',
    'ITZY Not Shy',
    'ITZY DALLA DALLA',
    'ITZY ICY',
    'ITZY CAKE',

    // SEVENTEEN
    'SEVENTEEN Left Right',
    'SEVENTEEN God of Music',
    'SEVENTEEN HOT',
    'SEVENTEEN Super',
    'SEVENTEEN Very Nice',

    // Red Velvet
    'Red Velvet Psycho',
    'Red Velvet Feel My Rhythm',
    'Red Velvet Bad Boy',
    'Red Velvet Peek-A-Boo',
    'Red Velvet Russian Roulette',

    // ENHYPEN
    'ENHYPEN Drunk-Dazed',
    'ENHYPEN Bite Me',
    'ENHYPEN Polaroid Love',
    'ENHYPEN Given-Taken',

    // LE SSERAFIM
    'LE SSERAFIM FEARLESS',
    'LE SSERAFIM ANTIFRAGILE',
    'LE SSERAFIM Unforgiven',
    'LE SSERAFIM Eve Psyche',

    // NMIXX
    'NMIXX O.O',
    'NMIXX DICE',
    'NMIXX Love Me Like This',

    // FIFTY FIFTY
    'FIFTY FIFTY Cupid',

    // 솔로 아티스트
    'Jungkook Seven',
    'Jungkook 3D',
    'LISA Money',
    'LISA LALISA',
    'IU Celebrity',
    'IU Through the Night',
    'IU Blueming',
    'IU Love poem',
    'TAEYEON Weekend',
    'TAEYEON INVU',

    // TXT
    'TXT Sugar Rush Ride',
    'TXT Good Boy Gone Bad',
    'TXT Crown',

    // 기타 인기곡
    'Girls Generation FOREVER 1',
    'EXO Love Shot',
    'GOT7 Just Right',
    'ATEEZ Guerrilla',
    'NCT 127 Kick It'
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

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return { success: false, message: 'Supabase 관리자 클라이언트가 설정되지 않았습니다.' };
    }

    // Transform Spotify tracks to database format
    const dbTracks = spotifyTracks.map(track => {
      // Fix release_date format - Spotify sometimes returns just year ("2001")
      let releaseDate = track.album.release_date;
      if (releaseDate) {
        if (releaseDate.startsWith('0000')) {
          // Invalid date like "0000-01-01" - set to null
          releaseDate = null;
        } else if (releaseDate.length === 4) {
          // Year only - convert to YYYY-01-01
          releaseDate = `${releaseDate}-01-01`;
        } else if (releaseDate.length === 7) {
          // YYYY-MM format - convert to YYYY-MM-01
          releaseDate = `${releaseDate}-01`;
        }
      }

      return {
        id: track.id,
        name: track.name,
        artist_names: track.artists.map(a => a.name),
        album_name: track.album.name,
        album_image_url: track.album.images[0]?.url || null,
        preview_url: track.preview_url || null,
        external_url: track.external_urls.spotify,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        release_date: releaseDate || null,
      };
    });

    console.log('💾 데이터베이스에 저장 중...');

    // Upsert to database (insert or update on conflict)
    const { error } = await supabaseAdmin
      .from('spotify_tracks')
      .upsert(dbTracks, { onConflict: 'id' });

    if (error) throw error;

    const message = `✅ 성공! ${spotifyTracks.length}개의 인기 K-Pop 트랙을 데이터베이스에 저장했습니다.`;
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