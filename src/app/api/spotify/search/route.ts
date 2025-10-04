// src/app/api/spotify/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ success: false, message: 'Query parameter required' }, { status: 400 });
  }

  if (!url || !key) {
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }

  const supabase = createClient(url, key);

  try {
    const { data, error } = await supabase
      .from('spotify_tracks')
      .select('id,name,artist_names,album_name,album_image_url,preview_url,external_url,duration_ms,popularity,release_date')
      .or(`name.ilike.%${query}%,artist_names.cs.{${query}}`)
      .order('popularity', { ascending: false, nullsFirst: false })
      .limit(20);

    if (error) {
      console.error('[api/spotify/search]', error);
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('[api/spotify/search] Unexpected error:', error);
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }
}
