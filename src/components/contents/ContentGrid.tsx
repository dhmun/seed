// src/components/contents/ContentGrid.tsx
"use client";

import { useState, useEffect } from 'react';
import { Content } from '@/lib/database';
import { useContents } from '@/hooks/useContents';
import ContentCard from './ContentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentGridProps {
  selectedContents?: Content[];
  onContentSelect?: (content: Content) => void;
  onContentDeselect?: (content: Content) => void;
  maxSelections?: number;
  variant?: 'default' | 'compact';
  showFilters?: boolean;
  showStats?: boolean;
}

const kindOptions = [
  { value: '', label: '전체' },
  { value: 'movie', label: '영화' },
  { value: 'drama', label: '드라마' },
  { value: 'show', label: '예능' },
  { value: 'kpop', label: 'K-POP' },
  { value: 'doc', label: '다큐멘터리' }
];

export default function ContentGrid({
  selectedContents = [],
  onContentSelect,
  onContentDeselect,
  maxSelections,
  variant = 'default',
  showFilters = true,
  showStats = true
}: ContentGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    contents,
    loading,
    error,
    hasMore,
    total,
    refetch,
    loadMore
  } = useContents({
    kind: selectedKind || undefined,
    search: debouncedSearch || undefined,
    limit: 20
  });

  const isSelected = (content: Content) => {
    return selectedContents.some(selected => selected.id === content.id);
  };

  const canSelectMore = !maxSelections || selectedContents.length < maxSelections;

  const handleContentSelect = (content: Content) => {
    if (canSelectMore && onContentSelect) {
      onContentSelect(content);
    }
  };

  const handleContentDeselect = (content: Content) => {
    if (onContentDeselect) {
      onContentDeselect(content);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          콘텐츠 로딩 오류
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          {error}
        </p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 및 검색 */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <Input
              placeholder="콘텐츠 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedKind} onValueChange={setSelectedKind}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="종류 선택" />
            </SelectTrigger>
            <SelectContent>
              {kindOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 결과 요약 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            총 {total}개의 콘텐츠
          </span>
          {selectedContents.length > 0 && (
            <Badge variant="secondary">
              {selectedContents.length}개 선택됨
              {maxSelections && ` / ${maxSelections}`}
            </Badge>
          )}
        </div>
        
        {(searchQuery || selectedKind) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedKind('');
            }}
          >
            필터 초기화
          </Button>
        )}
      </div>

      {/* 콘텐츠 그리드 */}
      {loading && contents.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-zinc-400" />
            <p className="text-zinc-600 dark:text-zinc-400">콘텐츠를 불러오는 중...</p>
          </div>
        </div>
      ) : contents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-zinc-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.465.898-6.05 2.366.413-.621.64-1.367.64-2.366 0-2.209-1.791-4-4-4s-4 1.791-4 4 1.791 4 4 4c.999 0 1.745-.227 2.366-.64A7.962 7.962 0 0112 21c2.34 0 4.465-.898 6.05-2.366C17.227 19.255 16.999 20 16 20c2.209 0 4-1.791 4-4s-1.791-4-4-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            다른 검색어나 필터를 사용해 보세요.
          </p>
        </div>
      ) : (
        <div className={
          variant === 'compact' 
            ? 'space-y-2' 
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
        }>
          <AnimatePresence>
            {contents.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ContentCard
                  content={content}
                  selected={isSelected(content)}
                  onSelect={handleContentSelect}
                  onDeselect={handleContentDeselect}
                  showStats={showStats}
                  variant={variant}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                로딩 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}

      {/* 선택 제한 안내 */}
      {maxSelections && selectedContents.length >= maxSelections && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 shadow-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            최대 {maxSelections}개까지 선택할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}