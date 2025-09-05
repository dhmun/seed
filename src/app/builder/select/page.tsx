'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { getCachedContents, getPopularContents } from '@/lib/tmdb-cache';
import { 
  formatFileSize, 
  calculateTotalSize, 
  getCapacityInMB,
  getContentKindLabel,
  type ContentKind 
} from '@/lib/validations';
import type { Content } from '@/lib/supabase';

import SpotifyTrackSelector from '@/components/spotify-track-selector';

const contentKinds: { value: ContentKind | 'spotify' | 'tv'; label: string; icon: string }[] = [
  { value: 'movie', label: '영화', icon: '🎬' },
  { value: 'tv', label: 'TV 시리즈', icon: '📺' },
  { value: 'spotify', label: '음악', icon: '🎵' },
];

export default function ContentSelect() {
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSpotifyTrackIds, setSelectedSpotifyTrackIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<ContentKind | 'all' | 'spotify' | 'tv'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetCapacity, setTargetCapacity] = useState<'16' | '32'>('16');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 초기 콘텐츠 로드 (인기 콘텐츠 우선)
  useEffect(() => {
    async function loadInitialContents() {
      try {
        // 인기 콘텐츠를 먼저 로드 (빠른 표시)
        const popularData = await getPopularContents(undefined, 40);
        setContents(popularData);
        setFilteredContents(popularData);
        
        // 전체 콘텐츠 로드
        const allData = await getCachedContents({ 
          page: 1, 
          limit: 100,
          sortBy: 'popularity',
          sortOrder: 'desc'
        });
        
        setContents(allData.contents);
        setFilteredContents(allData.contents);
        setHasMore(allData.hasMore);
      } catch (error) {
        toast.error('콘텐츠를 불러오는데 실패했습니다.');
        console.error('Error loading contents:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialContents();
  }, []);

  // 필터링 및 실시간 검색
  useEffect(() => {
    async function applyFilters() {
      if (selectedFilter === 'spotify') {
        setFilteredContents([]); // Clear TMDB contents when Spotify filter is active
        return;
      }

      // 유효한 콘텐츠 종류 정의
      const validKinds: Array<"movie" | "drama" | "show" | "kpop" | "doc"> = ['movie', 'drama', 'show', 'kpop', 'doc'];

      try {
        // 검색어가 있으면 서버 검색 사용
        if (searchQuery.trim()) {
          // TV 시리즈 필터인 경우 drama, show, kpop을 모두 포함
          if (selectedFilter === 'tv') {
            const [dramaResults, showResults, kpopResults] = await Promise.all([
              getCachedContents({ search: searchQuery, kind: 'drama', page: 1, limit: 20, sortBy: 'popularity', sortOrder: 'desc' }),
              getCachedContents({ search: searchQuery, kind: 'show', page: 1, limit: 20, sortBy: 'popularity', sortOrder: 'desc' }),
              getCachedContents({ search: searchQuery, kind: 'kpop', page: 1, limit: 10, sortBy: 'popularity', sortOrder: 'desc' })
            ]);
            const combinedContents = [...dramaResults.contents, ...showResults.contents, ...kpopResults.contents];
            setFilteredContents(combinedContents);
            return;
          }

          // 유효한 콘텐츠 타입인 경우에만 kind 파라미터 설정
          let kindFilter: "movie" | "drama" | "show" | "kpop" | "doc" | undefined = undefined;
          const validKinds: Array<"movie" | "drama" | "show" | "kpop" | "doc"> = ['movie', 'drama', 'show', 'kpop', 'doc'];
          if (validKinds.includes(selectedFilter as any)) {
            kindFilter = selectedFilter as "movie" | "drama" | "show" | "kpop" | "doc";
          }

          const searchResults = await getCachedContents({
            search: searchQuery,
            kind: kindFilter,
            page: 1,
            limit: 50,
            sortBy: 'popularity',
            sortOrder: 'desc'
          });
          setFilteredContents(searchResults.contents);
          return;
        }

        // 카테고리 필터만 적용
        if (selectedFilter === 'tv') {
          // TV 시리즈: drama, show, kpop 합치기
          const [dramaData, showData, kpopData] = await Promise.all([
            getCachedContents({ kind: 'drama', page: 1, limit: 40, sortBy: 'popularity', sortOrder: 'desc' }),
            getCachedContents({ kind: 'show', page: 1, limit: 40, sortBy: 'popularity', sortOrder: 'desc' }),
            getCachedContents({ kind: 'kpop', page: 1, limit: 20, sortBy: 'popularity', sortOrder: 'desc' })
          ]);
          const combinedContents = [...dramaData.contents, ...showData.contents, ...kpopData.contents];
          setFilteredContents(combinedContents);
        } else if (validKinds.includes(selectedFilter as any)) {
          const filtered = await getCachedContents({
            kind: selectedFilter as "movie" | "drama" | "show" | "kpop" | "doc",
            page: 1,
            limit: 100,
            sortBy: 'popularity',
            sortOrder: 'desc'
          });
          setFilteredContents(filtered.contents);
        } else {
          setFilteredContents(contents);
        }
      } catch (error) {
        // 실패 시 클라이언트 사이드 필터링으로 폴백
        let filtered = contents;

        if (selectedFilter === 'tv') {
          // TV 시리즈: drama, show, kpop 포함
          filtered = filtered.filter(content => 
            content.kind === 'drama' || 
            content.kind === 'show' || 
            content.kind === 'kpop'
          );
        } else if (validKinds.includes(selectedFilter as any)) {
          filtered = filtered.filter(content => content.kind === selectedFilter);
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(content => 
            content.title.toLowerCase().includes(query) ||
            content.summary.toLowerCase().includes(query)
          );
        }

        setFilteredContents(filtered);
      }
    }

    // 검색 디바운싱
    const timeoutId = setTimeout(applyFilters, 300);
    return () => clearTimeout(timeoutId);
  }, [contents, selectedFilter, searchQuery]);

  // 선택된 콘텐츠들 + Spotify 트랙 용량 계산
  const selectedContents = contents.filter(content => selectedIds.includes(content.id));
  const contentsSizeMB = calculateTotalSize(selectedContents);
  const spotifyTracksSizeMB = selectedSpotifyTrackIds.length * 5; // 각 음악 트랙을 5MB로 계산
  const totalSizeMB = contentsSizeMB + spotifyTracksSizeMB;
  const capacityMB = getCapacityInMB(targetCapacity);
  const usagePercentage = (totalSizeMB / capacityMB) * 100;
  const isOverCapacity = usagePercentage > 100;
  const isMinimumMet = (selectedIds.length + selectedSpotifyTrackIds.length) >= 3;

  // 콘텐츠 선택/해제 (TMDB 콘텐츠만 해당)
  const toggleContent = (contentId: string) => {
    setSelectedIds(prev => {
      const newSelected = prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId];

      // 선택 시 용량 체크
      if (!prev.includes(contentId)) {
        const content = contents.find(c => c.id === contentId);
        if (content) {
          const testContentSize = calculateTotalSize([...selectedContents, content]);
          const testSpotifySize = selectedSpotifyTrackIds.length * 5;
          const testTotal = testContentSize + testSpotifySize;
          const testPercentage = (testTotal / capacityMB) * 100;

          if (testPercentage > 100) {
            toast.error(`용량을 초과했습니다. ${targetCapacity}GB 이하로 선택해주세요.`);
            return prev;
          }
        }
      }

      return newSelected;
    });
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

    // 선택된 콘텐츠 ID를 URL 쿼리로 전달
    const idsParam = selectedIds.join(',');
    const spotifyIdsParam = selectedSpotifyTrackIds.join(',');
    const capacityParam = targetCapacity;
    window.location.href = `/builder/customize?ids=${idsParam}&spotifyIds=${spotifyIdsParam}&capacity=${capacityParam}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/builder" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← 이전으로
          </Link>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 text-primary-blue border border-primary-blue/20 mb-4">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">2단계 / 4단계</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              콘텐츠 선택하기
            </h1>
            <p className="text-muted-foreground">
              마음에 드는 콘텐츠를 선택해주세요. 최소 3개 이상 선택해야 합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 좌측: 필터 및 용량 체크 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* 용량 체크 */}
              <Card className="p-6">
                <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  용량 체크
                </h3>

                {/* 용량 선택 */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Button
                      variant={targetCapacity === '16' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTargetCapacity('16')}
                      className="flex-1"
                    >
                      16GB
                    </Button>
                    <Button
                      variant={targetCapacity === '32' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTargetCapacity('32')}
                      className="flex-1"
                    >
                      32GB
                    </Button>
                  </div>
                </div>

                {/* 용량 게이지 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>사용량</span>
                    <span className={isOverCapacity ? 'text-destructive font-bold' : ''}>
                      {formatFileSize(totalSizeMB)} / {targetCapacity}GB
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(usagePercentage, 100)} 
                    className={`h-3 ${isOverCapacity ? '[&>div]:bg-destructive' : ''}`}
                  />
                  {isOverCapacity && (
                    <div className="flex items-center gap-1 text-destructive text-xs mt-2">
                      <AlertTriangle className="w-3 h-3" />
                      용량 초과! 일부 콘텐츠를 제거해주세요.
                    </div>
                  )}
                </div>

                {/* 선택 상태 */}
                <div className="text-sm text-muted-foreground">
                  <div>영화/TV: <strong>{selectedIds.length}</strong>개</div>
                  <div>음악: <strong>{selectedSpotifyTrackIds.length}</strong>개 ({spotifyTracksSizeMB}MB)</div>
                  <div className={!isMinimumMet ? 'text-orange-600 font-medium' : ''}>
                    최소 선택: <strong>3</strong>개
                  </div>
                </div>
              </Card>

              {/* 카테고리 필터 */}
              <Card className="p-6">
                <h3 className="font-heading font-bold text-lg mb-4">카테고리</h3>
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
                      variant={selectedFilter === kind.value ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedFilter(kind.value)}
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
              <Card className="p-4 mb-6">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="제목이나 내용으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
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
            ) : (
              filteredContents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                      : '조건에 맞는 콘텐츠가 없습니다.'
                    }
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredContents.map((content, index) => {
                      const isSelected = selectedIds.includes(content.id);
                      return (
                        <Card
                          key={content.id}
                          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                            isSelected 
                              ? 'ring-2 ring-primary-blue bg-primary-blue/5 border-primary-blue' 
                              : 'hover:shadow-md'
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
                              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-blue rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* 콘텐츠 정보 */}
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-sm line-clamp-2">{content.title}</h3>
                              <Badge variant="outline" className="text-xs ml-2 shrink-0">
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
                                <span className="text-xs text-muted-foreground">
                                  {new Date(content.release_date).getFullYear()}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {content.summary}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
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
                  {!searchQuery && hasMore && (
                    <div className="text-center mt-8">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (loadingMore) return;
                          
                          setLoadingMore(true);
                          try {
                            const nextPage = page + 1;
                            // TV 시리즈인 경우 drama, show, kpop 합치기
                            let moreData;
                            if (selectedFilter === 'tv') {
                              const [dramaMore, showMore, kpopMore] = await Promise.all([
                                getCachedContents({ page: nextPage, limit: 20, kind: 'drama', sortBy: 'popularity', sortOrder: 'desc' }),
                                getCachedContents({ page: nextPage, limit: 20, kind: 'show', sortBy: 'popularity', sortOrder: 'desc' }),
                                getCachedContents({ page: nextPage, limit: 10, kind: 'kpop', sortBy: 'popularity', sortOrder: 'desc' })
                              ]);
                              moreData = {
                                contents: [...dramaMore.contents, ...showMore.contents, ...kpopMore.contents],
                                hasMore: dramaMore.hasMore || showMore.hasMore || kpopMore.hasMore
                              };
                            } else {
                              // 유효한 콘텐츠 타입인지 확인
                              const validKinds: Array<"movie" | "drama" | "show" | "kpop" | "doc"> = ['movie', 'drama', 'show', 'kpop', 'doc'];
                              const kindFilter = validKinds.includes(selectedFilter as any) ? selectedFilter as "movie" | "drama" | "show" | "kpop" | "doc" : undefined;
                              
                              moreData = await getCachedContents({
                                page: nextPage,
                                limit: 50,
                                kind: kindFilter,
                                sortBy: 'popularity',
                                sortOrder: 'desc'
                              });
                            }
                            
                            setContents(prev => [...prev, ...moreData.contents]);
                            setPage(nextPage);
                            setHasMore(moreData.hasMore);
                          } catch (error) {
                            toast.error('더 많은 콘텐츠를 불러오는데 실패했습니다.');
                          } finally {
                            setLoadingMore(false);
                          }
                        }}
                        disabled={loadingMore}
                      >
                        {loadingMore ? '로딩 중...' : '더 많은 콘텐츠 보기'}
                      </Button>
                    </div>
                  )}
                </>
              )
            )}

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 lg:static lg:bg-transparent lg:border-t-0 lg:p-0 lg:mt-8">
              <div className="container max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                  <Link href="/builder">
                    <Button variant="outline" size="lg">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      이전
                    </Button>
                  </Link>
                  
                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={!isMinimumMet || isOverCapacity}
                    className="bg-primary-blue hover:bg-primary-blue/90"
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
  );
}