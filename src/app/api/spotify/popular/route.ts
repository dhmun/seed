// src/app/api/spotify/popular/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  if (!url || !key) {
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('spotify_tracks')
    .select('id,name,artist_names,album_name,album_image_url,preview_url,external_url,duration_ms,popularity,release_date')
    .order('popularity', { ascending: false, nullsFirst: false })
    .limit(20);

  if (error) {
    console.error('[api/spotify/popular]', error);
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }
  return NextResponse.json({ success: true, data: data ?? [] });
}
