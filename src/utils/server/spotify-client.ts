// Spotify Web API 클라이언트 (Client Credentials Flow)
class SpotifyClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  // 토큰 발급/갱신
  private async getAccessToken(): Promise<string> {
    // 토큰이 유효하면 재사용
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken!;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify credentials not configured');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Spotify token request failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error('Spotify API did not return an access token.');
      }
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1분 여유

      return this.accessToken!;
    } catch (error) {
      console.error('Spotify token error:', error);
      throw new Error('Failed to get Spotify access token');
    }
  }

  // 트랙 검색
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const searchParams = new URLSearchParams({
        q: query,
        type: 'track',
        market: 'KR', // 한국 시장
        limit: limit.toString()
      });

      const response = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tracks?.items || [];
    } catch (error) {
      console.error('Spotify search error:', error);
      return [];
    }
  }

  // 아티스트 검색
  async searchArtists(query: string, limit: number = 20): Promise<SpotifyArtist[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const searchParams = new URLSearchParams({
        q: query,
        type: 'artist',
        market: 'KR',
        limit: limit.toString()
      });

      const response = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify artist search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.artists?.items || [];
    } catch (error) {
      console.error('Spotify artist search error:', error);
      return [];
    }
  }

  // K-POP 추천 플레이리스트 가져오기
  async getKPopPlaylists(limit: number = 20): Promise<SpotifyPlaylist[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      const searchParams = new URLSearchParams({
        q: 'K-POP korean pop',
        type: 'playlist',
        market: 'KR',
        limit: limit.toString()
      });

      const response = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify playlist search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.playlists?.items || [];
    } catch (error) {
      console.error('Spotify playlist search error:', error);
      return [];
    }
  }
}

// Spotify 타입 정의
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

// 싱글톤 인스턴스
const spotifyClient = new SpotifyClient();
export default spotifyClient;

