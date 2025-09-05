'use server';

import spotifyClient, { type SpotifyTrack } from '@/utils/server/spotify-client'; // Import the default instance
import { supabaseAdmin } from '@/lib/supabase';

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
      release_date: track.album.release_date,
      popularity: track.popularity,
    }));

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
