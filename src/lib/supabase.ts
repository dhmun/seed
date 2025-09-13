// lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** ===== 타입 정의 ===== */
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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
};

export type Content  = Database['public']['Tables']['contents']['Row'];
export type Pack     = Database['public']['Tables']['packs']['Row'];
export type PackItem = Database['public']['Tables']['pack_items']['Row'];
export type Message  = Database['public']['Tables']['messages']['Row'];
export type Counter  = Database['public']['Tables']['counters']['Row'];

/** ===== 공용 유틸 ===== */
const isServer = typeof window === 'undefined';
function must(name: string, v: string | undefined): string {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/** ===== 클라이언트/서버 공용 (브라우저 사용 가능) =====
 * NEXT_PUBLIC_* 만 사용 → 클라이언트 번들 OK
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** ===== 서버 전용(Service Role) — Lazy Getter =====
 * 서비스 키는 서버에서만 접근. 클라이언트에서 호출 시 즉시 예외.
 * 모듈 로드시 바로 읽지 않으므로, 클라이언트 번들에 키가 포함되지 않음.
 */
let _admin: SupabaseClient<Database> | null = null;

export function supabaseAdmin(): SupabaseClient<Database> {
  if (!isServer) {
    // Edge/브라우저에서의 오남용 방지
    throw new Error('supabaseAdmin() is server-only. Do not call from the client.');
  }
  if (_admin) return _admin;

  const serviceKey = must('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
  _admin = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  return _admin;
}

/** ===== Supabase 연결 상태 체크 ===== */
export const isSupabaseConnected = (() => {
  try {
    // 환경 변수가 있고 'disabled'가 아닌 경우에만 Supabase 사용
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isDisabled = process.env.SUPABASE_DISABLED === 'true';
    
    return !!(supabaseUrl && serviceKey && !isDisabled);
  } catch {
    return false;
  }
})();
