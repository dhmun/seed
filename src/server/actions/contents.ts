'use server';

import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';
import type { Content } from '@/lib/supabase';

// Mock 데이터 (개발 모드용)
const mockContents: Content[] = [
  {
    id: '1',
    kind: 'movie',
    title: '기생충',
    summary: '봉준호 감독의 아카데미 작품상 수상작. 계급 갈등을 그린 블랙 코미디 스릴러.',
    thumbnail_url: 'https://via.placeholder.com/300x400/3B82F6/ffffff?text=기생충',
    size_mb: 4500,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    kind: 'movie',
    title: '미나리',
    summary: '미국으로 이민 온 한국 가족의 따뜻하고 아름다운 이야기.',
    thumbnail_url: 'https://via.placeholder.com/300x400/14B8A6/ffffff?text=미나리',
    size_mb: 3800,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    kind: 'drama',
    title: '오징어 게임',
    summary: '전 세계를 열광시킨 넷플릭스 오리지널 시리즈.',
    thumbnail_url: 'https://via.placeholder.com/300x400/F87171/ffffff?text=오징어게임',
    size_mb: 12000,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    kind: 'drama',
    title: '사랑의 불시착',
    summary: '북한과 남한을 배경으로 한 감동적인 로맨스 드라마.',
    thumbnail_url: 'https://via.placeholder.com/300x400/9333EA/ffffff?text=사랑의불시착',
    size_mb: 15600,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    kind: 'show',
    title: '유 퀴즈 온 더 블럭',
    summary: '유재석과 조세호의 따뜻한 토크쇼.',
    thumbnail_url: 'https://via.placeholder.com/300x400/F59E0B/ffffff?text=유퀴즈',
    size_mb: 2800,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    kind: 'show',
    title: '런닝맨',
    summary: '웃음과 재미가 가득한 대표 예능 프로그램.',
    thumbnail_url: 'https://via.placeholder.com/300x400/10B981/ffffff?text=런닝맨',
    size_mb: 3200,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    kind: 'kpop',
    title: 'BTS - Dynamite',
    summary: '전 세계를 사로잡은 방탄소년단의 히트곡.',
    thumbnail_url: 'https://via.placeholder.com/300x400/8B5CF6/ffffff?text=BTS',
    size_mb: 150,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    kind: 'kpop',
    title: 'NewJeans - Get Up',
    summary: '4세대 아이돌을 대표하는 뉴진스의 인기곡.',
    thumbnail_url: 'https://via.placeholder.com/300x400/EC4899/ffffff?text=NewJeans',
    size_mb: 120,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '9',
    kind: 'doc',
    title: '나의 아름다운 정원',
    summary: '자연과 함께하는 힐링 다큐멘터리.',
    thumbnail_url: 'https://via.placeholder.com/300x400/059669/ffffff?text=나의아름다운정원',
    size_mb: 5200,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '10',
    kind: 'doc',
    title: '한국사 탐험',
    summary: '우리 역사를 재조명하는 교양 프로그램.',
    thumbnail_url: 'https://via.placeholder.com/300x400/7C3AED/ffffff?text=한국사탐험',
    size_mb: 6800,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export async function listContents(kind?: string): Promise<Content[]> {
  try {
    if (!isSupabaseConnected) {
      // Mock 데이터 사용
      let filtered = mockContents.filter(c => c.is_active);
      if (kind) {
        filtered = filtered.filter(c => c.kind === kind);
      }
      return filtered;
    }

    let query = supabaseAdmin
      .from('contents')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contents:', error);
      throw new Error('콘텐츠를 불러오는데 실패했습니다.');
    }

    return data || [];
  } catch (error) {
    console.error('listContents error:', error);
    throw new Error('콘텐츠를 불러오는데 실패했습니다.');
  }
}

export async function getContentsByIds(ids: string[]): Promise<Content[]> {
  try {
    if (!isSupabaseConnected) {
      // Mock 데이터 사용
      return mockContents.filter(c => ids.includes(c.id) && c.is_active);
    }

    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('*')
      .in('id', ids)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching contents by IDs:', error);
      throw new Error('선택한 콘텐츠를 불러오는데 실패했습니다.');
    }

    return data || [];
  } catch (error) {
    console.error('getContentsByIds error:', error);
    throw new Error('선택한 콘텐츠를 불러오는데 실패했습니다.');
  }
}

export async function getContentStats() {
  try {
    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('kind')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching content stats:', error);
      return { total: 0, byKind: {} };
    }

    const total = data.length;
    const byKind = data.reduce((acc: Record<string, number>, content: { kind: string }) => {
      acc[content.kind] = (acc[content.kind] || 0) + 1;
      return acc;
    }, {});

    return { total, byKind };
  } catch (error) {
    console.error('getContentStats error:', error);
    return { total: 0, byKind: {} };
  }
}