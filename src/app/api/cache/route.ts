import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/tmdb-cache';
import { headers } from 'next/headers';

// 캐시 관리 API (관리자용)
export async function POST(request: NextRequest) {
  try {
    // 기본적인 인증 체크 (프로덕션에서는 더 강력한 인증 필요)
    const headersList = await headers();
    const adminToken = headersList.get('authorization')?.replace('Bearer ', '');
    
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: '권한이 없습니다.'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, pattern } = body;

    switch (action) {
      case 'invalidate':
        // 캐시 무효화
        await invalidateCache(pattern);
        return NextResponse.json({
          success: true,
          message: pattern ? `패턴 "${pattern}"에 해당하는 캐시가 무효화되었습니다.` : '모든 캐시가 무효화되었습니다.'
        });

      case 'status':
        // 캐시 상태 조회
        return NextResponse.json({
          success: true,
          data: {
            status: 'active',
            type: 'memory',
            ttl: '30 minutes',
            cleanup_interval: '5 minutes'
          }
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '지원하지 않는 액션입니다.'
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '캐시 작업을 수행하는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'TMDB Cache API',
      endpoints: {
        'POST /api/cache': 'Cache management (admin only)',
        'GET /api/contents': 'Get cached contents with filters',
        'GET /api/contents/[id]': 'Get content by ID',
        'POST /api/contents': 'Get stats or genres'
      }
    }
  });
}