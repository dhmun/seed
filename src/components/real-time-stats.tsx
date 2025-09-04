'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface StatsData {
  participants: number;
  shares: number;
  contentSelections: number;
  totalPacks: number;
  lastUpdated: string;
}

export default function RealTimeStats() {
  const [stats, setStats] = useState<StatsData>({
    participants: 847,
    shares: 421,
    contentSelections: 1234,
    totalPacks: 847,
    lastUpdated: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState(stats);

  // 숫자 애니메이션 함수
  const animateNumber = (start: number, end: number, duration: number = 1000) => {
    const startTime = Date.now();
    const difference = end - start;

    const updateNumber = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentNumber = Math.floor(start + (difference * easeOutQuart));
      
      return currentNumber;
    };

    return updateNumber;
  };

  // 통계 데이터 fetch
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const newStats = await response.json();
        
        // 숫자 애니메이션 시작
        const participantsAnimator = animateNumber(animatedStats.participants, newStats.participants);
        const sharesAnimator = animateNumber(animatedStats.shares, newStats.shares);
        const contentAnimator = animateNumber(animatedStats.contentSelections, newStats.contentSelections);
        
        let startTime = Date.now();
        const duration = 1500;
        
        const animate = () => {
          const progress = (Date.now() - startTime) / duration;
          
          if (progress <= 1) {
            setAnimatedStats({
              participants: participantsAnimator(),
              shares: sharesAnimator(),
              contentSelections: contentAnimator(),
              totalPacks: newStats.totalPacks,
              lastUpdated: newStats.lastUpdated
            });
            
            requestAnimationFrame(animate);
          } else {
            setAnimatedStats(newStats);
          }
        };
        
        requestAnimationFrame(animate);
        setStats(newStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchStats();
  }, []);

  // 30초마다 업데이트
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [animatedStats]);

  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
      <Card className="p-4 bg-card/50 border-0 backdrop-blur-sm transition-all duration-300 hover:bg-card/70">
        <div className={`text-2xl font-bold text-primary-blue transition-all duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          {formatNumber(animatedStats.participants)}
          {!isLoading && (
            <span className="inline-block ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="실시간 업데이트" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">참여자</div>
        <div className="text-xs text-muted-foreground/70 mt-1">
          미디어팩 생성자 수
        </div>
      </Card>
      
      <Card className="p-4 bg-card/50 border-0 backdrop-blur-sm transition-all duration-300 hover:bg-card/70">
        <div className={`text-2xl font-bold text-mint transition-all duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          {formatNumber(animatedStats.shares)}
          {!isLoading && (
            <span className="inline-block ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="실시간 업데이트" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">공유 횟수</div>
        <div className="text-xs text-muted-foreground/70 mt-1">
          소셜미디어 공유 추정
        </div>
      </Card>
      
      <Card className="p-4 bg-card/50 border-0 backdrop-blur-sm transition-all duration-300 hover:bg-card/70">
        <div className={`text-2xl font-bold text-coral transition-all duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          {formatNumber(animatedStats.contentSelections)}
          {!isLoading && (
            <span className="inline-block ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="실시간 업데이트" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">콘텐츠 선택</div>
        <div className="text-xs text-muted-foreground/70 mt-1">
          총 선택된 미디어 수
        </div>
      </Card>
      
      {/* 최근 업데이트 시간 표시 */}
      <div className="col-span-full text-center">
        <p className="text-xs text-muted-foreground/50">
          {!isLoading && (
            <>
              마지막 업데이트: {new Date(animatedStats.lastUpdated).toLocaleTimeString('ko-KR')}
              <span className="ml-2 inline-block w-1 h-1 bg-green-400 rounded-full animate-pulse" />
            </>
          )}
        </p>
      </div>
    </div>
  );
}