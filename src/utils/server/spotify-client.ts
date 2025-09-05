// src/utils/server/spotify-client.ts
// Node.js runtime 전용 (Next.js 서버 컴포넌트/Route Handler/Server Action에서 사용)

type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: SpotifyImage[];
  external_urls: { spotify: string };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  owner: { id: string; display_name: string };
  tracks: { total: number };
  external_urls: { spotify: string };
}

class SpotifyClient {
  private accessToken: string | null = null;
  private tokenExpiry = 0;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    // 생성자에서는 빈 값으로 초기화
    this.clientId = "";
    this.clientSecret = "";
  }

  // 환경 변수를 실시간으로 읽는 메서드
  private getCredentials() {
    return {
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ""
    };
  }

  // Node.js 전용: Basic 헤더 생성
  private basicAuthHeader(): string {
    // Edge 런타임에서는 Buffer 미지원 → 반드시 Node.js에서만 호출
    const { clientId, clientSecret } = this.getCredentials();
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    return `Basic ${basic}`;
  }

  // 토큰 발급/갱신
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    const { clientId, clientSecret } = this.getCredentials();
    if (!clientId || !clientSecret) {
      throw new Error("Spotify credentials not configured");
    }

    const body = new URLSearchParams({ grant_type: "client_credentials" });

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: this.basicAuthHeader(),
      },
      body,
      // 캐시 방지
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Spotify token request failed: ${res.status} ${res.statusText} ${text}`);
    }

    const data: any = await res.json();
    if (!data?.access_token || !data?.expires_in) {
      throw new Error("Spotify API did not return an access token.");
    }

    this.accessToken = data.access_token;
    // 만료 60초 전에 갱신
    this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000;
    return this.accessToken!;
  }

  // 공통 검색 호출기
  private async search<T>(query: string, type: "track" | "artist" | "playlist", limit = 20, market?: string): Promise<T[]> {
    if (!query.trim()) return [];

    const accessToken = await this.getAccessToken();

    const params = new URLSearchParams({
      q: query,
      type,
      limit: String(limit),
    });

    if (market) params.set("market", market);

    const url = `https://api.spotify.com/v1/search?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Spotify search failed: ${res.status} ${res.statusText} ${text}`);
    }

    const data: any = await res.json();
    if (type === "track") return (data?.tracks?.items ?? []) as T[];
    if (type === "artist") return (data?.artists?.items ?? []) as T[];
    if (type === "playlist") return (data?.playlists?.items ?? []) as T[];
    return [];
  }

  async searchTracks(query: string, limit = 20, market = "KR"): Promise<SpotifyTrack[]> {
    return this.search<SpotifyTrack>(query, "track", limit, market);
  }

  async searchArtists(query: string, limit = 20, market = "KR"): Promise<SpotifyArtist[]> {
    return this.search<SpotifyArtist>(query, "artist", limit, market);
  }

  async getKPopPlaylists(limit = 20, market = "KR"): Promise<SpotifyPlaylist[]> {
    // 추천 키워드는 가변 → 기본값만 제공
    return this.search<SpotifyPlaylist>("K-POP korean pop", "playlist", limit, market);
  }

  // 특정 플레이리스트의 트랙들을 가져오기
  async getPlaylistTracks(playlistId: string, limit = 50, market = "KR"): Promise<SpotifyTrack[]> {
    const accessToken = await this.getAccessToken();

    const params = new URLSearchParams({
      limit: String(limit),
      market
    });

    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Spotify playlist tracks fetch failed: ${res.status} ${res.statusText} ${text}`);
    }

    const data: any = await res.json();
    
    // 플레이리스트의 트랙 아이템들에서 실제 트랙 정보 추출
    const tracks = data?.items?.map((item: any) => item?.track).filter((track: any) => track && track.id) ?? [];
    
    return tracks as SpotifyTrack[];
  }

  // 여러 플레이리스트의 트랙들을 한 번에 가져오기
  async getMultiplePlaylistTracks(playlistIds: string[], limit = 50, market = "KR"): Promise<SpotifyTrack[]> {
    const allTracks: SpotifyTrack[] = [];
    const uniqueTrackIds = new Set<string>();

    for (const playlistId of playlistIds) {
      try {
        const tracks = await this.getPlaylistTracks(playlistId, limit, market);
        
        // 중복 제거
        for (const track of tracks) {
          if (!uniqueTrackIds.has(track.id)) {
            uniqueTrackIds.add(track.id);
            allTracks.push(track);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch tracks from playlist ${playlistId}:`, error);
        // 하나의 플레이리스트 실패해도 다른 플레이리스트는 계속 처리
      }
    }

    return allTracks;
  }
}

// 싱글톤
const spotifyClient = new SpotifyClient();
export default spotifyClient;
