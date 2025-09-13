// src/hooks/useContents.ts
import { useState, useEffect, useCallback } from 'react';
import { Content } from '@/lib/database';

interface UseContentsParams {
  kind?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ContentsResponse {
  contents: Content[];
  total: number;
  hasMore: boolean;
  page?: number;
}

interface UseContentsReturn {
  contents: Content[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  refetch: () => void;
  loadMore: () => void;
}

export function useContents({
  kind,
  search,
  page = 1,
  limit = 20
}: UseContentsParams = {}): UseContentsReturn {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchContents = useCallback(async (reset = true, isSearch = false) => {
    // 검색 중일 때는 별도의 로딩 상태 사용
    if (isSearch) {
      setSearchLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (kind) params.append('kind', kind);
      if (search) params.append('search', search);
      params.append('page', reset ? '1' : currentPage.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/contents?${params}`);
      
      if (!response.ok) {
        throw new Error('콘텐츠를 불러오는데 실패했습니다.');
      }

      const data: { success: boolean; data: ContentsResponse; error?: string } = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '콘텐츠를 불러오는데 실패했습니다.');
      }

      if (reset) {
        setContents(data.data.contents);
        setCurrentPage(1);
      } else {
        setContents(prev => {
          const newContents = data.data.contents.filter(
            (newItem) => !prev.some(prevItem => prevItem.id === newItem.id)
          );
          return [...prev, ...newContents];
        });
      }
      
      setHasMore(data.data.hasMore);
      setTotal(data.data.total);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('Contents fetch error:', err);
    } finally {
      if (isSearch) {
        setSearchLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [kind, search, currentPage, limit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const refetch = useCallback(() => {
    fetchContents(true, !!search);
  }, [fetchContents, search]);

  // Debounced search effect
  useEffect(() => {
    const isSearching = !!search;
    const timeoutId = setTimeout(() => {
      fetchContents(true, isSearching);
    }, isSearching ? 500 : 0); // 500ms delay for search, immediate for other changes

    return () => clearTimeout(timeoutId);
  }, [kind, search, limit]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchContents(false);
    }
  }, [currentPage]);

  return {
    contents,
    loading,
    searchLoading,
    error,
    hasMore,
    total,
    refetch,
    loadMore
  };
}

// 인기 콘텐츠 조회 훅
export function usePopularContents(kind?: string, limit = 10) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopular = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('popular', 'true');
      params.append('limit', limit.toString());
      if (kind) params.append('kind', kind);

      const response = await fetch(`/api/contents?${params}`);
      
      if (!response.ok) {
        throw new Error('인기 콘텐츠를 불러오는데 실패했습니다.');
      }

      const data: { success: boolean; data: ContentsResponse; error?: string } = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '인기 콘텐츠를 불러오는데 실패했습니다.');
      }

      setContents(data.data.contents);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('Popular contents fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [kind, limit]);

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return {
    contents,
    loading,
    error,
    refetch: fetchPopular
  };
}