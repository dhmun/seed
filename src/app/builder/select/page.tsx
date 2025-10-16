'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  HardDrive,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useContents, usePopularContents } from '@/hooks/useContents';
import { formatFileSize, calculateTotalSize, getCapacityInMB, getContentKindLabel } from '@/lib/utils';
import type { Content } from '@/lib/supabase';

import SpotifyTrackSelector from '@/components/spotify-track-selector';
import TopNav from '@/components/nav/top-nav';

const contentKinds: { value: Content['kind'] | 'all' | 'spotify'; label: string; icon: string }[] = [
  { value: 'movie', label: '영화', icon: '🎬' },
  { value: 'drama', label: '드라마', icon: '📺' },
  { value: 'show', label: '예능', icon: '🎭' },
  { value: 'doc', label: '다큐멘터리', icon: '📽️' },
  { value: 'kpop', label: '음악', icon: '🎵' },
];

export default function ContentSelect() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedContentsMap, setSelectedContentsMap] = useState<Map<string, Content>>(new Map());
  const [selectedSpotifyTrackIds, setSelectedSpotifyTrackIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<Content['kind'] | 'all' | 'spotify'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetCapacity, setTargetCapacity] = useState<'32' | '64'>('32');

  // 새로운 hooks 사용
  const {
    contents,
    loading,
    searchLoading,
    error,
    hasMore,
    total,
    refetch,
    loadMore
  } = useContents({
    kind: selectedFilter === 'all' || selectedFilter === 'spotify' ? undefined : selectedFilter,
    search: searchQuery || undefined,
    limit: 20
  });

    // 에러 처리
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // 선택된 콘텐츠들 + Spotify 트랙 용량 계산
  const selectedContents = Array.from(selectedContentsMap.values());
  const contentsSizeMB = calculateTotalSize(selectedContents);
  const spotifyTracksSizeMB = selectedSpotifyTrackIds.length * 5; // 각 음악 트랙을 5MB로 계산
  const totalSizeMB = contentsSizeMB + spotifyTracksSizeMB;
  const capacityMB = getCapacityInMB(targetCapacity);
  const usagePercentage = (totalSizeMB / capacityMB) * 100;
  const isOverCapacity = usagePercentage > 100;
  const isMinimumMet = (selectedIds.length + selectedSpotifyTrackIds.length) >= 3;

  // 콘텐츠 선택/해제 (TMDB 콘텐츠만 해당)
  const toggleContent = (contentId: string) => {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const isCurrentlySelected = selectedIds.includes(contentId);

    if (isCurrentlySelected) {
      // 선택 해제
      setSelectedIds(prev => prev.filter(id => id !== contentId));
      setSelectedContentsMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(contentId);
        return newMap;
      });
    } else {
      // 선택 추가 - 용량 체크
      const testContentSize = calculateTotalSize([...selectedContents, content]);
      const testSpotifySize = selectedSpotifyTrackIds.length * 5;
      const testTotal = testContentSize + testSpotifySize;
      const testPercentage = (testTotal / capacityMB) * 100;

      if (testPercentage > 100) {
        toast.error(`용량을 초과했습니다. ${targetCapacity}GB 이하로 선택해주세요.`);
        return;
      }

      setSelectedIds(prev => [...prev, contentId]);
      setSelectedContentsMap(prev => new Map(prev).set(contentId, content));
    }
  };

  const handleNext = () => {
    if (!isMinimumMet) {
      toast.error('최소 3개의 콘텐츠를 선택해주세요.');
      return;
    }

    if (isOverCapacity) {
      toast.error('선택한 콘텐츠가 용량을 초과했습니다.');
      return;
    }

    // localStorage 동기화 (페이지 전환 시 데이터 유지)
    try {
      localStorage.setItem('selectedContentIds', JSON.stringify(selectedIds));
      localStorage.setItem('selectedSpotifyTrackIds', JSON.stringify(selectedSpotifyTrackIds));
      localStorage.setItem('targetCapacity', targetCapacity);

      console.log('📦 Saved to localStorage:', {
        contentIds: selectedIds.length,
        spotifyIds: selectedSpotifyTrackIds.length,
        capacity: targetCapacity
      });
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      toast.error('데이터 저장에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    // Next.js router로 페이지 전환 (URL 쿼리 포함)
    const params = new URLSearchParams();
    if (selectedIds.length > 0) params.append('ids', selectedIds.join(','));
    if (selectedSpotifyTrackIds.length > 0) params.append('spotifyIds', selectedSpotifyTrackIds.join(','));
    params.append('capacity', targetCapacity);

    router.push(`/builder/customize?${params.toString()}`);
  };

  if (loading && contents.length === 0) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">콘텐츠를 불러오는 중...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8 px-4">
        <div className="container max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-20">
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 mb-4">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">2단계 / 4단계</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                콘텐츠 선택하기
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                마음에 드는 콘텐츠를 선택해주세요. 최소 3개 이상 선택해야 합니다.
              </p>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 좌측: 필터 및 용량 체크 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* 용량 체크 */}
              <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  용량 체크
                </h3>

                {/* 용량 선택 */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Button
                      variant={targetCapacity === '32' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTargetCapacity('32')}
                      className="flex-1"
                    >
                      32GB
                    </Button>
                    <Button
                      variant={targetCapacity === '64' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTargetCapacity('64')}
                      className="flex-1"
                    >
                      64GB
                    </Button>
                  </div>
                </div>

                {/* 용량 게이지 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>사용량</span>
                    <span className={isOverCapacity ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-white'}>
                      {formatFileSize(totalSizeMB)} / {targetCapacity}GB
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(usagePercentage, 100)} 
                    className={`h-3 ${isOverCapacity ? '[&>div]:bg-destructive' : ''}`}
                  />
                  {isOverCapacity && (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs mt-2">
                      <AlertTriangle className="w-3 h-3" />
                      용량 초과! 일부 콘텐츠를 제거해주세요.
                    </div>
                  )}
                </div>

                {/* 선택 상태 */}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div>영화/TV: <strong className="text-gray-900 dark:text-white">{selectedIds.length}</strong>개</div>
                  <div>음악: <strong className="text-gray-900 dark:text-white">{selectedSpotifyTrackIds.length}</strong>개 ({spotifyTracksSizeMB}MB)</div>
                  <div className={!isMinimumMet ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                    최소 선택: <strong className="text-gray-900 dark:text-white">3</strong>개
                  </div>
                </div>
              </Card>

              {/* 카테고리 필터 */}
              <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">카테고리</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedFilter('all')}
                    className="w-full justify-start"
                  >
                    전체
                  </Button>
                  {contentKinds.map((kind) => (
                    <Button
                      key={kind.value}
                      variant={selectedFilter === kind.value || (kind.value === 'kpop' && selectedFilter === 'spotify') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        // K-POP 선택 시 spotify 필터로 전환
                        if (kind.value === 'kpop') {
                          setSelectedFilter('spotify');
                        } else {
                          setSelectedFilter(kind.value);
                        }
                      }}
                      className="w-full justify-start"
                    >
                      <span className="mr-2">{kind.icon}</span>
                      {kind.label}
                    </Button>
                  ))}
                </div>
              </Card>

              
            </div>
          </div>

          {/* 우측: 콘텐츠 그리드 */}
          <div className="lg:col-span-3">
            {/* 검색 바 (Spotify가 아닐 때만 표시) */}
            {selectedFilter !== 'spotify' && (
              <Card className="p-4 mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder="제목이나 내용으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-3">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                    >
                      초기화
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {selectedFilter === 'spotify' ? (
              <SpotifyTrackSelector
                onSelectTracks={setSelectedSpotifyTrackIds}
                initialSelectedIds={selectedSpotifyTrackIds}
                currentContentsSizeMB={contentsSizeMB}
                capacityMB={capacityMB}
                targetCapacity={`${targetCapacity}GB`}
              />
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">콘텐츠를 불러오는 중...</p>
              </div>
            ) : contents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                    : '조건에 맞는 콘텐츠가 없습니다.'
                  }
                </p>
                <button onClick={refetch} className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
                  다시 시도
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {contents.map((content, index) => {
                      const isSelected = selectedIds.includes(content.id);
                      return (
                        <Card
                          key={content.id}
                          className={`p-4 cursor-pointer transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md ${
                            isSelected 
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => toggleContent(content.id)}
                        >
                          {/* 썸네일 */}
                          <div className="relative mb-3">
                            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                              <Image
                                src={content.thumbnail_url}
                                alt={content.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={index < 6} // 첫 6개 이미지에 priority 적용
                              />
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* 콘텐츠 정보 */}
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-sm line-clamp-2 text-gray-900 dark:text-white">{content.title}</h3>
                              <Badge variant="outline" className="text-xs ml-2 shrink-0 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                {getContentKindLabel(content.kind)}
                              </Badge>
                            </div>
                            
                            {/* TMDB 메타데이터 추가 정보 */}
                            <div className="flex items-center gap-2 mb-2">
                              {content.vote_average && content.vote_average > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="text-xs font-medium">{content.vote_average.toFixed(1)}</span>
                                </div>
                              )}
                              {content.release_date && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(content.release_date).getFullYear()}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                              {content.summary}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(content.size_mb)}
                              </span>
                              <Button 
                                size="sm" 
                                variant={isSelected ? "default" : "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleContent(content.id);
                                }}
                              >
                                {isSelected ? '선택됨' : '선택'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* 더 보기 버튼 */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? '로딩 중...' : '더 많은 콘텐츠 보기'}
                      </Button>
                    </div>
                  )}
                </>
              )
            }

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 lg:static lg:bg-transparent lg:border-t-0 lg:p-0 lg:mt-8">
              <div className="container max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                  <Link href="/builder">
                    <Button variant="outline" size="lg" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      이전
                    </Button>
                  </Link>
                  
                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={!isMinimumMet || isOverCapacity}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    다음
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>
    </>
  );
}