'use server';

import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';
import type { Content } from '@/lib/supabase';

// Mock 데이터 타입 헬퍼
const createMockContent = (partial: Partial<Content> & Pick<Content, 'id' | 'kind' | 'title' | 'summary' | 'thumbnail_url' | 'size_mb' | 'is_active' | 'created_at'>): Content => ({
  tmdb_id: null,
  vote_average: null,
  release_date: null,
  genre_ids: null,
  popularity: null,
  original_title: null,
  backdrop_url: null,
  tmdb_type: null,
  vote_count: null,
  adult: null,
  original_language: null,
  updated_at: partial.created_at || new Date().toISOString(),
  ...partial
});

// Mock 데이터 (개발 모드용) - TMDb API에서 가져온 실제 데이터
const mockContents: Content[] = [
  // URL에서 사용되는 ID들을 위한 데이터
  {
    id: 'movie_755898',
    kind: 'movie',
    title: '라이온 킹',
    summary: '자연계의 법칙에 따라 만물의 왕인 사자 무파사의 아들 심바가 아버지의 왕좌를 이어받기 위해 성장하는 과정을 그린 디즈니 애니메이션',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
    size_mb: 4200,
    is_active: true,
    created_at: '2025-09-04T21:25:24.291Z',
    tmdb_id: null,
    vote_average: null,
    release_date: null,
    genre_ids: null,
    popularity: null,
    original_title: null,
    backdrop_url: null,
    tmdb_type: null,
    vote_count: null,
    adult: null,
    original_language: null,
    updated_at: '2025-09-04T21:25:24.291Z'
  },
  {
    id: 'movie_1311031',
    kind: 'movie',
    title: '모아나 2',
    summary: '모아나와 마우이가 새로운 모험을 떠나는 디즈니의 속편 애니메이션. 바다 너머 새로운 섬들을 탐험하며 더 큰 위험에 맞서게 된다.',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/4YZpsylmjHbqeWzjKpUEF8gcLNW.jpg',
    size_mb: 3850,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z',
    tmdb_id: null,
    vote_average: null,
    release_date: null,
    genre_ids: null,
    popularity: null,
    original_title: null,
    backdrop_url: null,
    tmdb_type: null,
    vote_count: null,
    adult: null,
    original_language: null,
    updated_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: 'tv_119051',
    kind: 'drama',
    title: '수요일',
    summary: '아담스 패밀리의 딸 웬즈데이 아담스가 네버모어 아카데미에서 겪는 미스터리와 성장을 그린 넷플릭스 오리지널 시리즈',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    size_mb: 5200,
    is_active: true,
    created_at: '2025-09-04T21:25:24.293Z',
    tmdb_id: null,
    vote_average: null,
    release_date: null,
    genre_ids: null,
    popularity: null,
    original_title: null,
    backdrop_url: null,
    tmdb_type: null,
    vote_count: null,
    adult: null,
    original_language: null,
    updated_at: '2025-09-04T21:25:24.293Z'
  },
  {
    id: 'movie_506763',
    kind: 'movie',
    title: '샹치와 텐 링즈의 전설',
    summary: '마블 시네마틱 유니버스의 새로운 영웅 샹치가 아버지의 과거와 맞서며 자신의 운명을 찾아가는 액션 어드벤처',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/xeItgLjkoata9YKs3kH0mp5cuKB.jpg',
    size_mb: 4500,
    is_active: true,
    created_at: '2025-09-04T21:25:24.294Z',
    tmdb_id: null,
    vote_average: null,
    release_date: null,
    genre_ids: null,
    popularity: null,
    original_title: null,
    backdrop_url: null,
    tmdb_type: null,
    vote_count: null,
    adult: null,
    original_language: null,
    updated_at: '2025-09-04T21:25:24.294Z'
  },
  createMockContent({
    id: 'tv_157239',
    kind: 'drama',
    title: '더 베어',
    summary: '시카고의 이탈리아계 미국인 쇠고기 샌드위치 레스토랑을 배경으로 한 요리사들의 이야기를 그린 코미디 드라마',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/xm1LY6NpPE8NUu8BnSjlKl8JNQX.jpg',
    size_mb: 3200,
    is_active: true,
    created_at: '2025-09-04T21:25:24.295Z'
  }),
  createMockContent({
    id: 'movie_911430',
    kind: 'movie',
    title: '바빌론',
    summary: '1920년대 할리우드를 배경으로 영화 산업의 과도기를 겪는 배우들과 제작진들의 이야기를 그린 드라마',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/wjOHjWCUE0YzDiEzKv8AfqHj3ir.jpg',
    size_mb: 6800,
    is_active: true,
    created_at: '2025-09-04T21:25:24.296Z'
  }),
  // 영화들 (40개)
  createMockContent({
    id: '1',
    kind: 'movie',
    title: '우주전쟁',
    summary: '전설적인 동명 소설을 새롭게 재해석한 이번 작품은 거대한 침공의 서막을 알린다. 에바 롱고리아와 전설적인 래퍼이자 배우 아이스 큐브, 그리고 마이클 오닐과 이만 벤슨이 합류해, 기...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg',
    size_mb: 3763,
    is_active: true,
    created_at: '2025-09-04T21:25:24.291Z'
  }),
  createMockContent({
    id: '2',
    kind: 'movie',
    title: 'F1 더 무비',
    summary: '한때 주목받는 유망주였지만 끔찍한 사고로 F1®에서 우승하지 못하고 한순간에 추락한 드라이버 소니 헤이스. 그의 오랜 동료인 루벤 세르반테스에게 레이싱 복귀를 제안받으며 최하위 팀...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/p6t8zioyQSWHCt0GRnRgsQrb8zx.jpg',
    size_mb: 7856,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  }),
  // ... (mock data is truncated for brevity)
  createMockContent({
    id: '100',
    kind: 'drama',
    title: '패밀리 가이',
    summary: '로드 아일랜드의 쿼호그라는 도시에서 살아가는 가장 피터, 아내 로이스, 장녀 메그, 차남 크리스, 막내 스튜이, 개 브라이언으로 이루어진 그리핀 가족과 그 주변인들의 일상을 다루고...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/1pbtcqNDKeWErfsDQo82pTPXQjT.jpg',
    size_mb: 10865,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  })
];

export async function listContents(kind?: string): Promise<Content[]> {
  if (!isSupabaseConnected) {
    // Fallback to mock data
    let filtered = mockContents.filter(c => c.is_active);
    if (kind) {
      filtered = filtered.filter(c => c.kind === kind);
    }
    return filtered;
  }

  try {
    let query = supabaseAdmin
      .from('contents')
      .select('*')
      .eq('is_active', true);

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contents:', error);
      // Fallback to mock data on error
      let filtered = mockContents.filter(c => c.is_active);
      if (kind) {
        filtered = filtered.filter(c => c.kind === kind);
      }
      return filtered;
    }

    return data || [];
  } catch (error) {
    console.error('Error in listContents:', error);
    // Fallback to mock data on error
    let filtered = mockContents.filter(c => c.is_active);
    if (kind) {
      filtered = filtered.filter(c => c.kind === kind);
    }
    return filtered;
  }
}

export async function getContentsByIds(ids: string[]): Promise<Content[]> {
  console.log('🔍 getContentsByIds called with:', ids);

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    console.log('⚠️ Invalid or empty IDs array');
    return [];
  }

  if (!isSupabaseConnected) {
    console.log('⚠️ Supabase not connected, using mock data');
    // Fallback to mock data
    return mockContents.filter(c => ids.includes(c.id) && c.is_active);
  }

  try {
    console.log('🔎 Querying Supabase for IDs:', ids);
    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('*')
      .in('id', ids)
      .eq('is_active', true);

    console.log('📊 Supabase response - data:', data?.length, 'error:', error);

    if (error) {
      console.error('Error fetching contents by IDs:', error);
      // Fallback to mock data on error
      return mockContents.filter(c => ids.includes(c.id) && c.is_active);
    }

    // If no data from Supabase, fallback to mock data
    if (!data || data.length === 0) {
      return mockContents.filter(c => ids.includes(c.id) && c.is_active);
    }

    return data;
  } catch (error) {
    console.error('Error in getContentsByIds:', error);
    // Fallback to mock data on error
    return mockContents.filter(c => ids.includes(c.id) && c.is_active);
  }
}

// DB에 콘텐츠 추가 (중복 방지)
export async function addContentToDb(content: Partial<Content>): Promise<Content> {
  if (!isSupabaseConnected) {
    // Mock 모드에서는 간단한 ID 생성
    const mockContent: Content = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      kind: content.kind || 'movie',
      title: content.title || 'Unknown Title',
      summary: content.summary || 'No description available',
      thumbnail_url: content.thumbnail_url || '',
      size_mb: content.size_mb || Math.floor(Math.random() * (500 - 50 + 1)) + 50,
      is_active: true,
      created_at: new Date().toISOString(),
      ...content
    };
    return mockContent;
  }

  try {
    const newContent = {
      id: content.id || `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      kind: content.kind || 'movie',
      title: content.title || 'Unknown Title',
      summary: content.summary || 'No description available',
      thumbnail_url: content.thumbnail_url || '',
      size_mb: content.size_mb || Math.floor(Math.random() * (500 - 50 + 1)) + 50,
      is_active: true,
      ...content
    };

    const { data, error } = await supabaseAdmin
      .from('contents')
      .upsert(newContent)
      .select()
      .single();

    if (error) {
      console.error('Error adding content to database:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addContentToDb:', error);
    throw error;
  }
}

export async function getContentStats() {
  if (!isSupabaseConnected) {
    // Mock 데이터 기반 통계 반환
    const total = mockContents.length;
    const byKind = mockContents.reduce((acc: Record<string, number>, content: { kind: string }) => {
      acc[content.kind] = (acc[content.kind] || 0) + 1;
      return acc;
    }, {});

    return { total, byKind };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('kind')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching content stats:', error);
      // Fallback to mock data
      const total = mockContents.length;
      const byKind = mockContents.reduce((acc: Record<string, number>, content: { kind: string }) => {
        acc[content.kind] = (acc[content.kind] || 0) + 1;
        return acc;
      }, {});
      return { total, byKind };
    }

    const total = data.length;
    const byKind = data.reduce((acc: Record<string, number>, content: { kind: string }) => {
      acc[content.kind] = (acc[content.kind] || 0) + 1;
      return acc;
    }, {});

    return { total, byKind };
  } catch (error) {
    console.error('Error in getContentStats:', error);
    // Fallback to mock data
    const total = mockContents.length;
    const byKind = mockContents.reduce((acc: Record<string, number>, content: { kind: string }) => {
      acc[content.kind] = (acc[content.kind] || 0) + 1;
      return acc;
    }, {});
    return { total, byKind };
  }
}
