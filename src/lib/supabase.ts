import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key';

// 개발 모드 체크
const isDevelopment = process.env.NODE_ENV === 'development';
const hasValidSupabaseConfig = supabaseUrl !== 'https://demo.supabase.co' && 
                               supabaseAnonKey !== 'demo-anon-key';

// 개발 모드에서 Demo 값이면 클라이언트를 생성하지 않음
let supabase: any = null;
let supabaseAdmin: any = null;

if (hasValidSupabaseConfig) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  // Mock clients for development
  supabase = {
    from: () => ({
      select: () => ({ error: new Error('Mock mode - Supabase not connected') })
    })
  };
  supabaseAdmin = {
    from: () => ({
      select: () => ({ error: new Error('Mock mode - Supabase not connected') })
    }),
    rpc: () => ({ error: new Error('Mock mode - Supabase not connected') })
  };
}

// 클라이언트 사이드 Supabase 인스턴스
export { supabase };

// 서버 사이드 전용 (서비스 역할)
export { supabaseAdmin };

// 개발 모드 여부 확인
export const isSupabaseConnected = hasValidSupabaseConfig;

// 타입 정의
export type Database = {
  public: {
    Tables: {
      contents: {
        Row: {
          id: string;
          kind: 'movie' | 'drama' | 'show' | 'kpop' | 'doc';
          title: string;
          original_title?: string;
          summary: string;
          thumbnail_url: string;
          backdrop_url?: string;
          size_mb: number;
          is_active: boolean;
          tmdb_id?: number;
          tmdb_type?: 'movie' | 'tv';
          release_date?: string;
          genre_ids?: number[];
          vote_average?: number;
          vote_count?: number;
          popularity?: number;
          adult?: boolean;
          original_language?: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          kind: 'movie' | 'drama' | 'show' | 'kpop' | 'doc';
          title: string;
          summary: string;
          thumbnail_url: string;
          size_mb: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          kind?: 'movie' | 'drama' | 'show' | 'kpop' | 'doc';
          title?: string;
          summary?: string;
          thumbnail_url?: string;
          size_mb?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      packs: {
        Row: {
          id: string;
          name: string;
          message: string;
          serial: number;
          share_slug: string;
          og_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          message: string;
          serial: number;
          share_slug: string;
          og_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          message?: string;
          serial?: number;
          share_slug?: string;
          og_image_url?: string | null;
          created_at?: string;
        };
      };
      pack_items: {
        Row: {
          pack_id: string;
          content_id: string;
        };
        Insert: {
          pack_id: string;
          content_id: string;
        };
        Update: {
          pack_id?: string;
          content_id?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          pack_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pack_id?: string;
          body?: string;
          created_at?: string;
        };
      };
      counters: {
        Row: {
          key: string;
          value: number;
        };
        Insert: {
          key: string;
          value: number;
        };
        Update: {
          key?: string;
          value?: number;
        };
      };
      spotify_tracks: {
        Row: {
          id: string;
          name: string;
          artist_names: string[];
          album_name: string;
          album_image_url?: string | null;
          preview_url?: string | null;
          external_url: string;
          duration_ms?: number | null;
          release_date?: string | null;
          popularity?: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          artist_names: string[];
          album_name: string;
          album_image_url?: string | null;
          preview_url?: string | null;
          external_url: string;
          duration_ms?: number | null;
          release_date?: string | null;
          popularity?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          artist_names?: string[];
          album_name?: string;
          album_image_url?: string | null;
          preview_url?: string | null;
          external_url?: string;
          duration_ms?: number | null;
          release_date?: string | null;
          popularity?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type Content = Database['public']['Tables']['contents']['Row'];
export type Pack = Database['public']['Tables']['packs']['Row'];
export type PackItem = Database['public']['Tables']['pack_items']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Counter = Database['public']['Tables']['counters']['Row'];