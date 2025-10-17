'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { trackShare, trackPackCreation } from '@/lib/analytics';
import type { Content } from '@/lib/supabase';
import { classifyByContents } from '@/lib/pack-classifier';

interface PackResult {
  slug: string;
  serial: number;
  name: string;
  message: string;
  contents: Content[];
}

export default function ResultPage() {
  const [result, setResult] = useState<PackResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPackResult() {
      try {
        // 저장된 결과 로드
        const packResultStr = localStorage.getItem('packResult');
        if (!packResultStr) {
          toast.error('미디어팩 데이터가 없습니다.');
          window.location.href = '/builder';
          return;
        }

        const packResult = JSON.parse(packResultStr);
        
        // 선택된 콘텐츠 정보 가져오기
        const res = await fetch(`/api/contents/by-ids?ids=${encodeURIComponent(packResult.selectedContentIds.join(','))}`);
        const json = await res.json();
        const contents = (json?.data || []) as Content[];

        const fullPackResult = {
          slug: packResult.slug,
          serial: packResult.serial,
          name: packResult.name,
          message: packResult.message,
          contents
        };
        
        setResult(fullPackResult);

        // 로컬 스토리지 정리
        localStorage.removeItem('packResult');

        // 미디어팩 생성 추적 (analytics only)
        await trackPackCreation(packResult.slug, packResult.serial);

        toast.success('미디어팩이 성공적으로 생성되었습니다! 🎉');
      } catch (error) {
        console.error('Error loading pack result:', error);
        toast.error('미디어팩 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadPackResult();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-heading font-bold mb-2">미디어팩 생성 중...</h2>
          <p className="text-muted-foreground">잠시만 기다려 주세요</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-heading font-bold mb-4">미디어팩을 생성할 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">다시 시도해주세요.</p>
          <Link href="/builder">
            <Button>다시 만들기</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 border border-green-200 mb-6">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">미디어팩 생성 완료!</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            🎉 축하합니다!
          </h1>
          <p className="text-lg text-muted-foreground">
            <strong>{result.serial}번째 희망의 씨앗</strong>이 탄생했습니다
          </p>
        </div>

        {/* Result Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 좌측: 미디어팩 미리보기 */}
          <Card className="p-6 bg-gradient-to-br from-primary-blue/5 to-mint/5 border-primary-blue/20">
            <div className="mb-6">
              <Badge className="mb-4 bg-primary-blue text-white">
                {result.serial}번째 희망의 씨앗
              </Badge>
              
              <h2 className="text-2xl font-heading font-bold mb-3">
                {result.name}
              </h2>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                &ldquo;{result.message}&rdquo;
              </p>

              {/* 콘텐츠 썸네일 모자이크 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {result.contents.slice(0, 4).map((content, index) => (
                  <div key={content.id} className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={content.thumbnail_url}
                      alt={content.title}
                      width={150}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {result.contents.length > 4 && (
                  <div className="aspect-[3/4] rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                    +{result.contents.length - 4}개 더
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                총 {result.contents.length}개 콘텐츠 • {' '}
                {Math.round(result.contents.reduce((sum, c) => sum + c.size_mb, 0) / 1024 * 10) / 10}GB
              </div>
            </div>
          </Card>

          {/* 우측: 미디어팩 유형 */}
          <div className="space-y-6">
            {(() => {
              const packTypeInfo = classifyByContents(result.contents);
              const colorClasses = {
                blue: 'bg-blue-50 border-blue-200',
                green: 'bg-green-50 border-green-200',
                purple: 'bg-purple-50 border-purple-200',
                orange: 'bg-orange-50 border-orange-200',
                gray: 'bg-gray-50 border-gray-200',
              };
              const textColorClasses = {
                blue: 'text-blue-700',
                green: 'text-green-700',
                purple: 'text-purple-700',
                orange: 'text-orange-700',
                gray: 'text-gray-700',
              };

              return (
                <Card className={`p-6 border-2 ${colorClasses[packTypeInfo.color as keyof typeof colorClasses]}`}>
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3">{packTypeInfo.icon}</div>
                    <h3 className={`font-heading font-bold text-2xl mb-2 ${textColorClasses[packTypeInfo.color as keyof typeof textColorClasses]}`}>
                      {packTypeInfo.type}
                    </h3>
                    <div className="text-sm font-medium text-muted-foreground mb-4">
                      {packTypeInfo.percentage}% 비율
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    {packTypeInfo.description}
                  </p>
                </Card>
              );
            })()}

            <Card className="p-6 bg-warm-ivory/30">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-coral mt-1" />
                <div>
                  <h4 className="font-medium mb-1">미디어팩 생성 완료!</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.serial}번째 희망의 씨앗이 탄생했습니다. 더 많은 사람들이 함께할 수 있도록 공유해주세요.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/pack/${result.slug}`}>
              <Button variant="outline" size="lg">
                <ExternalLink className="w-4 h-4 mr-2" />
                미디어팩 페이지 보기
              </Button>
            </Link>
            
            <Link href="/builder">
              <Button size="lg" className="bg-primary-blue hover:bg-primary-blue/90">
                <Sparkles className="w-4 h-4 mr-2" />
                새로운 미디어팩 만들기
              </Button>
            </Link>
          </div>

          <Link href="/" className="inline-block">
            <Button variant="ghost" size="sm">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
