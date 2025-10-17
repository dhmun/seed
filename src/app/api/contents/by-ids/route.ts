import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getContentsByIds } from '@/server/actions/contents';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  ids: z.string().min(1), // comma-separated
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Missing or invalid ids param' }, { status: 400 });
    }

    const ids = parsed.data.ids.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const contents = await getContentsByIds(ids);
    return NextResponse.json({ success: true, data: contents });
  } catch (error) {
    console.error('[api/contents/by-ids] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch contents' }, { status: 500 });
  }
}

