'use server';

import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';
import type { Content } from '@/lib/supabase';

// 메모리 캐시 (프로덕션에서는 Redis 사용 권장)
class MemoryCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private readonly TTL = 30 * 60 * 1000; // 30분 TTL

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.TTL
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
   

  // 캐시 크기 제한 (메모리 관리)
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires < now) {
        this.cache.delete(key);
      }
    }

    // 최대 1000개 항목으로 제한
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].expires - b[1].expires);
      
      // 오래된 50% 제거
      const toRemove = entries.slice(0, Math.floor(entries.length * 0.5));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  // 주기적 정리 (5분마다)
  startCleanupTimer(): void {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
}

// 전역 캐시 인스턴스
const tmdbCache = new MemoryCache();
tmdbCache.startCleanupTimer();

// 캐시 키 생성기
function getCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const paramsStr = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return paramsStr ? `${prefix}:${paramsStr}` : prefix;
}

// 콘텐츠 목록 조회 (캐시 적용)
export async function getCachedContents(filters: {
  kind?: string;
  page?: number;
  limit?: number;
  sortBy?: 'popularity' | 'vote_average' | 'release_date' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  genre?: number[];
} = {}): Promise<{ contents: Content[]; total: number; hasMore: boolean }> {
  const {
    kind,
    page = 1,
    limit = 20,
    sortBy = 'popularity',
    sortOrder = 'desc',
    search,
    genre
  } = filters;

  const cacheKey = getCacheKey('contents', {
    kind,
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    genre: genre?.join(',')
  });

  // 캐시에서 확인
  const cached = tmdbCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let contents: Content[] = [];
    let total = 0;

    if (!isSupabaseConnected) {
      // Mock 데이터 사용 시 필터링 로직
      const mockContents = await import('@/server/actions/contents');
      let filtered = (await mockContents.listContents(kind)).filter(c => c.is_active);
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes(searchLower) ||
          c.summary.toLowerCase().includes(searchLower)
        );
      }

      total = filtered.length;
      
      // 정렬
      filtered.sort((a, b) => {
        const aVal = getFieldValue(a, sortBy);
        const bVal = getFieldValue(b, sortBy);
        const comparison = compareValues(aVal, bVal);
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      // 페이징
      const offset = (page - 1) * limit;
      contents = filtered.slice(offset, offset + limit);
    } else {
      // Supabase 쿼리
      let query = supabaseAdmin
        .from('contents')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (kind) {
        query = query.eq('kind', kind);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
      }

      if (genre && genre.length > 0) {
        query = query.overlaps('genre_ids', genre);
      }

      // 정렬
      const orderField = sortBy === 'title' ? 'title' : sortBy;
      query = query.order(orderField, { ascending: sortOrder === 'asc' });

      // 페이징
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching cached contents:', error);
        throw new Error('콘텐츠를 불러오는데 실패했습니다.');
      }

      contents = data || [];
      total = count || 0;
    }

    const result = {
      contents,
      total,
      hasMore: page * limit < total
    };

    // 결과를 캐시에 저장
    tmdbCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('getCachedContents error:', error);
    throw new Error('콘텐츠를 불러오는데 실패했습니다.');
  }
}

// 인기 콘텐츠 조회 (캐시 적용)
export async function getPopularContents(kind?: string, limit: number = 20): Promise<Content[]> {
  const cacheKey = getCacheKey('popular', { kind, limit });

  const cached = tmdbCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await getCachedContents({
      kind,
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc'
    });

    // 캐시에 저장 (더 긴 TTL)
    tmdbCache.set(cacheKey, result.contents);

    return result.contents;
  } catch (error) {
    console.error('getPopularContents error:', error);
    throw new Error('인기 콘텐츠를 불러오는데 실패했습니다.');
  }
}

// 장르별 콘텐츠 조회
export async function getContentsByGenre(genreIds: number[], limit: number = 20): Promise<Content[]> {
  const cacheKey = getCacheKey('genre', { genres: genreIds.join(','), limit });

  const cached = tmdbCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await getCachedContents({
      genre: genreIds,
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc'
    });

    tmdbCache.set(cacheKey, result.contents);
    return result.contents;
  } catch (error) {
    console.error('getContentsByGenre error:', error);
    throw new Error('장르별 콘텐츠를 불러오는데 실패했습니다.');
  }
}

// 검색 (캐시 적용)
export async function searchContents(query: string, filters: { kind?: string; limit?: number } = {}): Promise<Content[]> {
  const { kind, limit = 50 } = filters;
  const cacheKey = getCacheKey('search', { query, kind, limit });

  const cached = tmdbCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await getCachedContents({
      search: query,
      kind,
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc'
    });

    tmdbCache.set(cacheKey, result.contents);
    return result.contents;
  } catch (error) {
    console.error('searchContents error:', error);
    throw new Error('검색에 실패했습니다.');
  }
}

// 콘텐츠 통계 (캐시 적용)
export async function getCachedContentStats() {
  const cacheKey = 'stats';
  
  const cached = tmdbCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    if (!isSupabaseConnected) {
      // Mock 데이터 통계
      const mockContents = await import('@/server/actions/contents');
      const contents = await mockContents.listContents();
      
      const stats = {
        total: contents.length,
        byKind: contents.reduce((acc: Record<string, number>, content) => {
          acc[content.kind] = (acc[content.kind] || 0) + 1;
          return acc;
        }, {}),
        byGenre: {}, // Mock에서는 장르 정보가 없음
        avgRating: 0,
        totalVotes: 0
      };

      tmdbCache.set(cacheKey, stats);
      return stats;
    }

    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('kind, genre_ids, vote_average, vote_count')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching content stats:', error);
      throw new Error('통계를 불러오는데 실패했습니다.');
    }

    const total = data.length;
    const byKind = data.reduce((acc: Record<string, number>, content: any) => {
      acc[content.kind] = (acc[content.kind] || 0) + 1;
      return acc;
    }, {});

    const byGenre = data.reduce((acc: Record<number, number>, content: any) => {
      if (content.genre_ids) {
        content.genre_ids.forEach((genreId: number) => {
          acc[genreId] = (acc[genreId] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const totalVotes = data.reduce((sum: number, content: any) => sum + (content.vote_count || 0), 0);
    const avgRating = data.length > 0 
      ? data.reduce((sum: number, content: any) => sum + (content.vote_average || 0), 0) / data.length 
      : 0;

    const stats = {
      total,
      byKind,
      byGenre,
      avgRating: Math.round(avgRating * 10) / 10,
      totalVotes
    };

    tmdbCache.set(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error('getCachedContentStats error:', error);
    throw new Error('통계를 불러오는데 실패했습니다.');
  }
}

// 캐시 무효화
export async function invalidateCache(pattern?: string): Promise<void> {
  if (pattern) {
    // 특정 패턴의 캐시만 제거
    tmdbCache.clear(); // 간단 구현으로 전체 캐시 제거
  } else {
    tmdbCache.clear();
  }
}

// 유틸리티 함수들
function getFieldValue(obj: any, field: string): any {
  switch (field) {
    case 'popularity':
      return obj.popularity || 0;
    case 'vote_average':
      return obj.vote_average || 0;
    case 'release_date':
      return obj.release_date || obj.created_at || '1900-01-01';
    case 'title':
      return obj.title || '';
    default:
      return obj[field] || '';
  }
}

function compareValues(a: any, b: any): number {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b, 'ko');
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'ko');
}