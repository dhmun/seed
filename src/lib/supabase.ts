import { createClient } from '@supabase/supabase-js';

// Supabase 자동 생성 타입을 사용하거나, 아래처럼 수동으로 정의할 수 있습니다.
// 이 파일은 schema.sql을 기반으로 수동 작성되었습니다.

export type Database = {
  public: {
    Tables: {
      contents: {
        Row: {
          id: string;
          kind: 'movie' | 'drama' | 'show' | 'kpop' | 'doc';
          title: string;
          summary: string;
          thumbnail_url: string;
          size_mb: number;
          is_active: boolean;
          created_at: string;
          tmdb_id: number | null;
          vote_average: number | null;
          release_date: string | null;
          genre_ids: unknown | null;
          popularity: number | null;
          original_title: string | null;
          backdrop_url: string | null;
          tmdb_type: string | null;
          vote_count: number | null;
          adult: boolean | null;
          original_language: string | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['contents']['Row']>;
        Update: Partial<Database['public']['Tables']['contents']['Row']>;
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
        Update: Partial<Database['public']['Tables']['packs']['Row']>;
      };
      pack_items: {
        Row: { pack_id: string; content_id: string | null; spotify_track_id: string | null };
        Insert: { pack_id: string; content_id?: string | null; spotify_track_id?: string | null };
        Update: { pack_id?: string; content_id?: string | null; spotify_track_id?: string | null };
      };
      messages: {
        Row: { id: string; pack_id: string; body: string; created_at: string };
        Insert: { id?: string; pack_id: string; body: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      counters: {
        Row: { key: string; value: number };
        Insert: { key: string; value?: number };
        Update: { key?: string; value?: number };
      };
      share_events: {
        Row: { id: number; pack_slug: string; platform: string | null; created_at: string };
        Insert: { id?: number; pack_slug: string; platform?: string | null; created_at?: string };
        Update: Partial<Database['public']['Tables']['share_events']['Row']>;
      };
      pack_views: {
        Row: { id: number; pack_slug: string; created_at: string };
        Insert: { id?: number; pack_slug: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['pack_views']['Row']>;
      };
      spotify_tracks: {
        Row: {
          id: string;
          name: string;
          artist_names: string[];
          album_name: string;
          album_image_url: string | null;
          preview_url: string | null;
          external_urls: unknown | null;
          popularity: number | null;
          release_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['spotify_tracks']['Row']>;
        Update: Partial<Database['public']['Tables']['spotify_tracks']['Row']>;
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      increment_counter: {
        Args: { counter_key: string };
        Returns: number;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// 타입 별칭 (Type Aliases)
export type Content = Database['public']['Tables']['contents']['Row'];
export type Pack = Database['public']['Tables']['packs']['Row'];
export type PackItem = Database['public']['Tables']['pack_items']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Counter = Database['public']['Tables']['counters']['Row'];
export type SpotifyTrack = Database['public']['Tables']['spotify_tracks']['Row'];

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For server-side scripts, allow lazy initialization
let supabase: ReturnType<typeof createClient<Database>>;
let isSupabaseConnected = false;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  isSupabaseConnected = true;
} else if (typeof window === 'undefined') {
  // Server-side script without env vars - create a dummy client
  console.warn('[WARN] Supabase env vars not loaded. Creating dummy client.');
  supabase = null as any; // Will be initialized by scripts that properly load .env
} else {
  // Client-side without env vars - this is an error
  throw new Error('Supabase URL and Anon Key are required in .env.local');
}

export { supabase, isSupabaseConnected };


// =================================================================
// DO NOT USE IN CLIENT-SIDE CODE
// Admin client for server-side operations.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

if (serviceKey && supabaseUrl) {
  supabaseAdmin = createClient<Database>(supabaseUrl, serviceKey);
} else if (!serviceKey) {
  console.warn(`[WARN] SUPABASE_SERVICE_ROLE_KEY is not set. Supabase admin client is not available.`);
}

export { supabaseAdmin };
// =================================================================