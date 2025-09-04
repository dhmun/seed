import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, packSlug, platform } = body;

    if (!isSupabaseConnected) {
      // Mock 모드에서는 성공으로 처리
      console.log('Mock tracking:', { action, packSlug, platform });
      return NextResponse.json({ success: true, message: 'Tracked (mock mode)' });
    }

    // 실제 추적 로직
    switch (action) {
      case 'share':
        // 공유 이벤트 추적
        await supabaseAdmin
          .from('share_events')
          .insert({
            pack_slug: packSlug,
            platform: platform,
            created_at: new Date().toISOString()
          });
        
        // 공유 카운터 증가
        await supabaseAdmin
          .rpc('increment_counter', { counter_key: 'total_shares' });
        
        break;
        
      case 'view':
        // 미디어팩 조회 추적
        await supabaseAdmin
          .from('pack_views')
          .insert({
            pack_slug: packSlug,
            created_at: new Date().toISOString()
          });
        break;
        
      case 'content_select':
        // 콘텐츠 선택 추적
        await supabaseAdmin
          .rpc('increment_counter', { counter_key: 'content_selections' });
        break;
    }

    return NextResponse.json({ success: true, message: 'Event tracked successfully' });

  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track event' },
      { status: 500 }
    );
  }
}

// OPTIONS 메소드 추가 (CORS용)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}