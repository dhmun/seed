// src/app/api/spotify/popular/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request) {
  if (!url || !key) {
    return NextResponse.json({ success: true, data: [], total: 0, hasMore: false }, { status: 200 });
  }

  // 쿼리 파라미터에서 offset, limit 추출
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const supabase = createClient(url, key);

  // 전체 개수 조회
  const { count } = await supabase
    .from('spotify_tracks')
    .select('*', { count: 'exact', head: true });

  // 데이터 조회
  const { data, error } = await supabase
    .from('spotify_tracks')
    .select('id,name,artist_names,album_name,album_image_url,preview_url,external_url,duration_ms,popularity,release_date')
    .order('popularity', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[api/spotify/popular]', error);
    return NextResponse.json({ success: true, data: [], total: 0, hasMore: false }, { status: 200 });
  }

  const total = count || 0;
  const hasMore = offset + limit < total;

  return NextResponse.json({
    success: true,
    data: data ?? [],
    total,
    hasMore
  });
}
