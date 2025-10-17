import { NextRequest, NextResponse } from 'next/server';
import { syncSpotifyTracks } from '@/server/actions/spotify_sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const q = (body?.q || '').toString();
    const limit = Number(body?.limit ?? 20);

    const result = await syncSpotifyTracks(q, limit);
    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error('[api/spotify/sync] error:', error);
    return NextResponse.json({ success: false, message: 'Sync failed' }, { status: 500 });
  }
}

