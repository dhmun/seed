import { NextRequest, NextResponse } from 'next/server';
import { searchTMDb, searchSpotify, searchSpotifyArtist, searchUnified } from '@/server/actions/search';
import { z } from 'zod';

// 검색 파라미터 스키마
const searchParamsSchema = z.object({
  q: z.string().min(1, '검색어를 입력해주세요.'),
  type: z.enum(['all', 'movies', 'music', 'artists']).default('all'),
  limit: z.coerce.number().min(1).max(50).default(20)
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = searchParamsSchema.parse(Object.fromEntries(searchParams.entries()));

    const { q: query, type, limit } = params;

    let results;

    switch (type) {
      case 'movies':
        const movies = await searchTMDb(query);
        results = {
          movies: movies.slice(0, limit),
          music: [],
          total: movies.length
        };
        break;

      case 'music':
        const music = await searchSpotify(query);
        results = {
          movies: [],
          music: music.slice(0, limit),
          total: music.length
        };
        break;

      case 'artists':
        const artists = await searchSpotifyArtist(query);
        results = {
          movies: [],
          music: artists.slice(0, limit),
          total: artists.length
        };
        break;

      case 'all':
      default:
        results = await searchUnified(query);
        // 제한 적용
        results.movies = results.movies.slice(0, Math.floor(limit / 2));
        results.music = results.music.slice(0, Math.floor(limit / 2));
        results.total = results.movies.length + results.music.length;
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        query,
        type,
        ...results,
        cached: false // 실시간 검색이므로 캐시되지 않음
      }
    });
  } catch (error) {
    console.error('Search API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 검색 파라미터입니다.',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// 인기 K-POP 아티스트/트랙 추천
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'popular-kpop':
        // 인기 K-POP 아티스트들로 검색
        const popularKPopQueries = [
          'BTS', 'BLACKPINK', 'TWICE', 'NewJeans', 'IVE', 'aespa'
        ];
        
        const popularResults = await Promise.all(
          popularKPopQueries.map(query => searchSpotifyArtist(query))
        );

        const popularKPop = popularResults
          .flat()
          .filter(Boolean)
          .slice(0, 20);

        return NextResponse.json({
          success: true,
          data: {
            query: 'Popular K-POP',
            type: 'popular',
            movies: [],
            music: popularKPop,
            total: popularKPop.length
          }
        });

      case 'trending-tracks':
        // 트렌딩 K-POP 트랙들
        const trendingQueries = ['K-POP 2024', '한국 음악', 'Korean Pop'];
        
        const trendingResults = await Promise.all(
          trendingQueries.map(query => searchSpotify(query))
        );

        const trendingTracks = trendingResults
          .flat()
          .filter(Boolean)
          .slice(0, 20);

        return NextResponse.json({
          success: true,
          data: {
            query: 'Trending K-POP Tracks',
            type: 'trending',
            movies: [],
            music: trendingTracks,
            total: trendingTracks.length
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
    console.error('Search POST API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '요청을 처리하는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}