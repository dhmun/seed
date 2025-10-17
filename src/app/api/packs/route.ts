import { NextRequest, NextResponse } from 'next/server';
import { createPack } from '@/server/actions/packs';
import { createPackSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPackSchema.safeParse({
      name: body?.name,
      message: body?.message,
      selectedContentIds: body?.selectedContentIds,
    });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
    }

    const result = await createPack({
      name: parsed.data.name,
      message: parsed.data.message,
      selectedContentIds: parsed.data.selectedContentIds,
      selectedSpotifyIds: Array.isArray(body?.selectedSpotifyIds) ? body.selectedSpotifyIds : [],
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[api/packs] create error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create pack';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

