'use server';

import type { Content } from '@/lib/supabase';
import spotifyClient, { type SpotifyTrack, type SpotifyArtist } from '@/utils/server/spotify-client';
import { detectLanguage, isKoreanArtist } from '@/lib/utils_server';

// TMDb 검색
export async function searchTMDb(query: string): Promise<Content[]> {
  if (!query.trim()) return [];

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY not configured');
    return [];
  }

  try {
    const searchParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: query,
      language: 'ko-KR',
      page: '1'
    });

    const response = await fetch(`${TMDB_BASE_URL}/search/multi?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`TMDb search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];

    // Content 형식으로 변환
    return results
      .filter((item: any) => 
        item.poster_path && 
        item.overview && 
        (item.media_type === 'movie' || item.media_type === 'tv') &&
        !item.adult
      )
      .slice(0, 10)
      .map((item: any): Content => ({
        id: `tmdb-${item.id}`,
        kind: item.media_type === 'movie' ? 'movie' : 'drama',
        title: item.title || item.name,
        original_title: item.original_title || item.original_name || null,
        summary: item.overview,
        thumbnail_url: `${TMDB_IMAGE_BASE_URL}${item.poster_path}`,
        backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
        size_mb: Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000, // 3GB ~ 8GB
        is_active: true,
        tmdb_id: item.id,
        tmdb_type: item.media_type === 'movie' ? 'movie' : 'tv',
        release_date: item.release_date || item.first_air_date || null,
        genre_ids: item.genre_ids || [],
        vote_average: item.vote_average || 0,
        vote_count: item.vote_count || 0,
        popularity: item.popularity || 0,
        adult: item.adult || false,
        original_language: item.original_language || 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
  } catch (error) {
    console.error('TMDb search error:', error);
    return [];
  }
}

// Spotify 트랙 검색
export async function searchSpotify(query: string): Promise<Content[]> {
  if (!query.trim()) return [];

  try {
    const tracks = await spotifyClient.searchTracks(query, 10);

    return tracks
      .filter(track => 
        track.album.images.length > 0 && 
        track.artists.length > 0 &&
        track.name && 
        track.album.name
      )
      .map((track: SpotifyTrack): Content => ({
        id: `spotify-${track.id}`,
        kind: 'kpop',
        title: `${track.artists[0].name} - ${track.name}`,
        original_title: track.name,
        summary: `${track.album.name} 앨범의 수록곡. ${Math.floor(track.duration_ms / 60000)}분 ${Math.floor((track.duration_ms % 60000) / 1000)}초`,
        thumbnail_url: track.album.images[0]?.url || '',
        backdrop_url: track.album.images[0]?.url || null,
        size_mb: Math.floor(Math.random() * (200 - 50 + 1)) + 50, // 50MB ~ 200MB
        is_active: true,
        tmdb_id: null,
        tmdb_type: null,
        release_date: track.album.release_date || null,
        genre_ids: null,
        vote_average: track.popularity / 10, // 0-100을 0-10으로 변환
        vote_count: Math.floor(Math.random() * 1000) + 100, // 가상 투표 수
        popularity: track.popularity,
        adult: false,
        original_language: detectLanguage(track.name, track.artists[0].name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
}

// Spotify 아티스트 검색 (K-POP 위주)
export async function searchSpotifyArtist(query: string): Promise<Content[]> {
  if (!query.trim()) return [];

  try {
    const artists = await spotifyClient.searchArtists(query, 10);

    return artists
      .filter(artist => 
        artist.images.length > 0 && 
        artist.name &&
        (artist.genres.some(genre => 
          genre.toLowerCase().includes('k-pop') || 
          genre.toLowerCase().includes('korean')
        ) || isKoreanArtist(artist.name))
      )
      .map((artist: SpotifyArtist): Content => ({
        id: `spotify-artist-${artist.id}`,
        kind: 'kpop',
        title: artist.name,
        original_title: artist.name,
        summary: `${artist.genres.join(', ')} 아티스트. 인기도: ${artist.popularity}/100`,
        thumbnail_url: artist.images[0]?.url || '',
        backdrop_url: artist.images[0]?.url || null,
        size_mb: Math.floor(Math.random() * (500 - 100 + 1)) + 100, // 100MB ~ 500MB (앨범 모음)
        is_active: true,
        tmdb_id: null,
        tmdb_type: null,
        release_date: null,
        genre_ids: null,
        vote_average: artist.popularity / 10,
        vote_count: Math.floor(Math.random() * 5000) + 1000,
        popularity: artist.popularity,
        adult: false,
        original_language: 'ko', // K-POP 아티스트로 가정
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
  } catch (error) {
    console.error('Spotify artist search error:', error);
    return [];
  }
}

// 통합 검색 (TMDb + Spotify)
export async function searchUnified(query: string): Promise<{
  movies: Content[];
  music: Content[];
  total: number;
}> {
  try {
    // 병렬로 검색 실행
    const [tmdbResults, spotifyTracks, spotifyArtists] = await Promise.all([
      searchTMDb(query),
      searchSpotify(query),
      searchSpotifyArtist(query)
    ]);

    const music = [...spotifyTracks, ...spotifyArtists];

    return {
      movies: tmdbResults,
      music: music,
      total: tmdbResults.length + music.length
    };
  } catch (error) {
    console.error('Unified search error:', error);
    return {
      movies: [],
      music: [],
      total: 0
    };
  }
}

