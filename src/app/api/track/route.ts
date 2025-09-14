import { NextResponse, NextRequest } from 'next/server';
import { runQuery, getQuery } from '@/lib/sqlite-db'; // Import runQuery and getQuery

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, packSlug, platform } = body;

    // Mock 모드에서는 성공으로 처리 (SQLite 쿼리 실패 시 대체)
    // if (!isSupabaseConnected) { // Removed check
    //   console.log('Mock tracking:', { action, packSlug, platform });
    //   return NextResponse.json({ success: true, message: 'Tracked (mock mode)' });
    // }

    // 실제 추적 로직
    switch (action) {
      case 'share':
        // 공유 이벤트 추적
        await runQuery(
          `INSERT INTO share_events (pack_slug, platform, created_at) VALUES (?, ?, ?) `,
          [packSlug, platform, new Date().toISOString()]
        );
        
        // 공유 카운터 증가 (UPSERT)
        await runQuery(
          `INSERT INTO counters (key, value) VALUES (?, ?) 
           ON CONFLICT(key) DO UPDATE SET value = value + 1`,
          ['total_shares', 1]
        );
        
        break;
        
      case 'view':
        // 미디어팩 조회 추적
        await runQuery(
          `INSERT INTO pack_views (pack_slug, created_at) VALUES (?, ?) `,
          [packSlug, new Date().toISOString()]
        );
        break;
        
      case 'content_select':
        // 콘텐츠 선택 추적 (UPSERT)
        await runQuery(
          `INSERT INTO counters (key, value) VALUES (?, ?) 
           ON CONFLICT(key) DO UPDATE SET value = value + 1`,
          ['content_selections', 1]
        );
        break;
    }

    return NextResponse.json({ success: true, message: 'Event tracked successfully' });

  } catch (error) {
    console.error('Tracking API error:', error);
    // 에러시 Mock 데이터 반환
    console.log('Mock tracking (error fallback):', { action: body?.action, packSlug: body?.packSlug, platform: body?.platform });
    return NextResponse.json(
      { success: false, message: 'Failed to track event (error fallback)' },
      { status: 500 }
    );
  }
}

// OPTIONS 메소드 추가 (CORS용)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}