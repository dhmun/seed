import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, packSlug, platform } = body;

    // Mock 모드로 항상 콘솔에 로그를 남기고 성공 응답을 반환합니다.
    console.log('Mock tracking:', { action, packSlug, platform });
    return NextResponse.json({ success: true, message: 'Tracked (mock mode)' });

  } catch (error) {
    console.error('Tracking API error:', error);
    // 에러 발생 시에도 Mock 추적을 시도하고 응답합니다.
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      body = {};
    }
    console.log('Mock tracking (error fallback):', { action: body?.action, packSlug: body?.packSlug, platform: body?.platform });
    return NextResponse.json({ success: true, message: 'Tracked (error fallback)' });
  }
}

// OPTIONS 메소드 추가 (CORS용)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
