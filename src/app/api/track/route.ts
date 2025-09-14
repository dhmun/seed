import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, packSlug, platform } = body;

    // Supabase가 연결되어 있지 않으면 Mock 모드로 처리
    if (!isSupabaseConnected) {
      console.log('Mock tracking:', { action, packSlug, platform });
      return NextResponse.json({ success: true, message: 'Tracked (mock mode)' });
    }

    // 실제 추적 로직 (Supabase)
    try {
      switch (action) {
        case 'share':
          // 공유 이벤트 추적
          await supabaseAdmin()
            .from('share_events')
            .insert({ 
              pack_slug: packSlug, 
              platform: platform,
              created_at: new Date().toISOString() 
            });
          break;
          
        case 'view':
          // 미디어팩 조회 추적
          await supabaseAdmin()
            .from('pack_views')
            .insert({ 
              pack_slug: packSlug,
              created_at: new Date().toISOString() 
            });
          break;
          
        case 'content_select':
          // 콘텐츠 선택 추적은 로그 기록만 (별도 테이블이 없으므로)
          console.log('Content selection tracked:', { packSlug, timestamp: new Date().toISOString() });
          break;
      }

      return NextResponse.json({ success: true, message: 'Event tracked successfully' });
    } catch (supabaseError) {
      console.log('Supabase tracking failed, using mock fallback:', supabaseError);
      return NextResponse.json({ success: true, message: 'Tracked (fallback mode)' });
    }

  } catch (error) {
    console.error('Tracking API error:', error);
    // 에러시 Mock 데이터 반환
    console.log('Mock tracking (error fallback):', { action: body?.action, packSlug: body?.packSlug, platform: body?.platform });
    return NextResponse.json({ success: true, message: 'Tracked (error fallback)' });
  }
}

// OPTIONS 메소드 추가 (CORS용)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}