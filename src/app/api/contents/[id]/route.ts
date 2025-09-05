import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';
import { notFound } from 'next/navigation';

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

    if (!isSupabaseConnected) {
      // Mock 데이터에서 검색
      const { listContents } = await import('@/server/actions/contents');
      const contents = await listContents();
      const content = contents.find(c => c.id === id && c.is_active);
      
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
    }

    // Supabase에서 조회
    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching content by ID:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: '콘텐츠를 찾을 수 없습니다.'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: '콘텐츠를 불러오는데 실패했습니다.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
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