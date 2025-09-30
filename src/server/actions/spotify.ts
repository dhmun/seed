'use server';

export interface SpotifyTrackRow {
  id: string;
  name: string;
  artist_names: string[];
  album_name: string;
  album_image_url?: string;
  preview_url?: string;
  external_url: string;
  duration_ms: number;
  popularity: number;
  release_date?: string;
  created_at: string;
}

export async function getSpotifyTracksByIds(ids: string[]): Promise<SpotifyTrackRow[]> {
  try {
    // Mock 모드에서는 빈 배열 반환
    return [];
  } catch (error) {
    console.error('getSpotifyTracksByIds error:', error);
    return [];
  }
}

export async function getAllSpotifyTracks(limit: number = 100): Promise<SpotifyTrackRow[]> {
  try {
    // Mock 모드에서는 빈 배열 반환
    return [];
  } catch (error) {
    console.error('getAllSpotifyTracks error:', error);
    return [];
  }
}