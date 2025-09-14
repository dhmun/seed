import { NextRequest, NextResponse } from 'next/server';
import { getQuery } from '@/lib/sqlite-db';
import { Content } from '@/lib/sqlite-db'; // Import Content type

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '콘텐츠 ID가 필요합니다.'
        },
        { status: 400 }
      );
    }

    // SQLite에서 조회
    const content = await getQuery<Content>('SELECT * FROM contents WHERE id = ? AND is_active = 1', [id]);

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: '콘텐츠를 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Content detail API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '콘텐츠를 불러오는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}