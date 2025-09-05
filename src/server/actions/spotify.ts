'use server';

import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type SpotifyTrackRow = Database['public']['Tables']['spotify_tracks']['Row'];

export async function getSpotifyTracksByIds(ids: string[]): Promise<SpotifyTrackRow[]> {
  try {
    if (!isSupabaseConnected || ids.length === 0) {
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('spotify_tracks')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error fetching Spotify tracks by IDs:', error);
      throw new Error('선택한 음악을 불러오는데 실패했습니다.');
    }

    return data || [];
  } catch (error) {
    console.error('getSpotifyTracksByIds error:', error);
    throw new Error('선택한 음악을 불러오는데 실패했습니다.');
  }
}

export async function getAllSpotifyTracks(limit: number = 100): Promise<SpotifyTrackRow[]> {
  try {
    if (!isSupabaseConnected) {
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('spotify_tracks')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all Spotify tracks:', error);
      throw new Error('음악 목록을 불러오는데 실패했습니다.');
    }

    return data || [];
  } catch (error) {
    console.error('getAllSpotifyTracks error:', error);
    throw new Error('음악 목록을 불러오는데 실패했습니다.');
  }
}