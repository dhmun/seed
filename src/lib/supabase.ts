// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

/** ===== 타입 정의 (유지) ===== */
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
        Row: { pack_id: string; content_id: string; };
        Insert: { pack_id: string; content_id: string; };
        Update: { pack_id?: string; content_id?: string; };
      };
      messages: {
        Row: { id: string; pack_id: string; body: string; created_at: string; };
        Insert: { id?: string; pack_id: string; body: string; created_at?: string; };
        Update: { id?: string; pack_id?: string; body?: string; created_at?: string; };
      };
      counters: {
        Row: { key: string; value: number; };
        Insert: { key: string; value: number; };
        Update: { key?: string; value?: number; };
      };
      spotify_tracks: {
        Row: {
          id: string;
          name: string;
          artist_names: string[];
          album_name: string;
          album_image_url: string | null;
          preview_url: string | null;
          spotify_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          artist_names: string[];
          album_name: string;
          album_image_url?: string | null;
          preview_url?: string | null;
          spotify_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          artist_names?: string[];
          album_name?: string;
          album_image_url?: string | null;
          preview_url?: string | null;
          spotify_id?: string;
          created_at?: string;
        };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
};

export type Content      = Database['public']['Tables']['contents']['Row'];
export type Pack         = Database['public']['Tables']['packs']['Row'];
export type PackItem     = Database['public']['Tables']['pack_items']['Row'];
export type Message      = Database['public']['Tables']['messages']['Row'];
export type Counter      = Database['public']['Tables']['counters']['Row'];
export type SpotifyTrack = Database['public']['Tables']['spotify_tracks']['Row'];

/** ===== Supabase 클라이언트 설정 ===== */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 클라이언트용 Supabase 인스턴스
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 서버용 Supabase 인스턴스 (admin 권한)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Supabase 연결 상태 체크
export const isSupabaseConnected = !!(supabaseUrl && supabaseAnonKey)