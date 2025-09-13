import { NextRequest, NextResponse } from 'next/server';
import { getAllContents, getContentsByKind, getContentsWithPagination, searchContents } from '@/lib/database';
import { z } from 'zod';

// 요청 파라미터 검증 스키마
const contentsParamsSchema = z.object({
  kind: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['popularity', 'vote_average', 'release_date', 'title']).default('popularity'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  genre: z.string().optional(), // 쉼표로 구분된 장르 ID들
  popular: z.string().optional() // 인기 콘텐츠만 조회
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = contentsParamsSchema.parse(Object.fromEntries(searchParams.entries()));

    const {
      kind,
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      genre,
      popular
    } = params;

    // 장르 파라미터 파싱
    const genreIds = genre ? genre.split(',').map(Number).filter(Boolean) : undefined;

    // 인기 콘텐츠만 조회하는 경우
    if (popular) {
      const contents = kind 
        ? await getContentsByKind(kind)
        : await getAllContents();
      
      // 인기도로 정렬하고 limit 적용
      const popularContents = contents
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, limit);
        
      return NextResponse.json({
        success: true,
        data: {
          contents: popularContents,
          total: popularContents.length,
          hasMore: false,
          page: 1
        }
      });
    }

    // 검색 요청인 경우
    if (search) {
      console.log('Search query:', search);
      const contents = await searchContents(search);
      console.log('Search results count:', contents.length);
      const filteredContents = kind 
        ? contents.filter(c => c.kind === kind)
        : contents;
      
      return NextResponse.json({
        success: true,
        data: {
          contents: filteredContents.slice(0, limit),
          total: filteredContents.length,
          hasMore: filteredContents.length > limit,
          page: 1,
          query: search
        }
      });
    }

    // 일반 콘텐츠 목록 조회
    const result = await getContentsWithPagination(page, limit, kind);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        page
      }
    });
  } catch (error) {
    console.error('Contents API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 요청 파라미터입니다.',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '콘텐츠를 불러오는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}

// 콘텐츠 통계 조회용 별도 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'stats':
        // 간단한 통계 반환
        const allContents = await getAllContents();
        const stats = {
          total: allContents.length,
          byKind: {
            movie: allContents.filter(c => c.kind === 'movie').length,
            drama: allContents.filter(c => c.kind === 'drama').length,
            show: allContents.filter(c => c.kind === 'show').length,
            kpop: allContents.filter(c => c.kind === 'kpop').length,
            doc: allContents.filter(c => c.kind === 'doc').length
          }
        };
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'genres':
        // TMDB 장르 목록 반환 (하드코딩된 주요 장르들)
        const genres = [
          { id: 28, name: '액션' },
          { id: 12, name: '모험' },
          { id: 16, name: '애니메이션' },
          { id: 35, name: '코미디' },
          { id: 80, name: '범죄' },
          { id: 99, name: '다큐멘터리' },
          { id: 18, name: '드라마' },
          { id: 10751, name: '가족' },
          { id: 14, name: '판타지' },
          { id: 36, name: '역사' },
          { id: 27, name: '공포' },
          { id: 10402, name: '음악' },
          { id: 9648, name: '미스터리' },
          { id: 10749, name: '로맨스' },
          { id: 878, name: 'SF' },
          { id: 10770, name: 'TV 영화' },
          { id: 53, name: '스릴러' },
          { id: 10752, name: '전쟁' },
          { id: 37, name: '서부' }
        ];
        
        return NextResponse.json({
          success: true,
          data: genres
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
    console.error('Contents POST API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '요청을 처리하는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}