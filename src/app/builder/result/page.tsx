'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Download, 
  Heart, 
  Sparkles, 
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Users,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { getContentsByIds } from '@/server/actions/contents';
import { trackShare, trackPackCreation } from '@/lib/analytics';
import type { Content } from '@/lib/supabase';

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
  const [sharing, setSharing] = useState(false);

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
        const contents = await getContentsByIds(packResult.selectedContentIds);

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

  const shareUrl = result ? `${window.location.origin}/pack/${result.slug}` : '';

  const handleCopyLink = async () => {
    if (!shareUrl || !result) return;
    
    try {
      const copySuccess = await safeCopyToClipboard(shareUrl);
      if (copySuccess) {
        await trackShare('copy_link', result.slug);
        toast.success('링크가 복사되었습니다!');
      } else {
        toast.error('링크 복사에 실패했습니다.');
      }
    } catch (error) {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const handleKakaoShare = async () => {
    if (!result || !shareUrl) return;

    // 카카오 공유 추적
    await trackShare('kakao', result.slug);

    // 카카오 SDK 로드 체크 (실제 구현 시 필요)
    if (typeof window !== 'undefined' && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${result.name} | 희망의 씨앗 캠페인`,
          description: result.message,
          imageUrl: `${window.location.origin}/api/og?slug=${result.slug}`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '미디어팩 보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      toast.error('카카오톡 공유 기능을 사용할 수 없습니다.');
    }
  };

  const handleSocialShare = async (platform: 'facebook' | 'twitter') => {
    if (!result || !shareUrl) return;

    // 소셜 공유 추적
    await trackShare(platform, result.slug);

    const text = `${result.name} - ${result.message}`;
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  // 안전한 클립보드 복사 헬퍼 함수
  const safeCopyToClipboard = async (text: string): Promise<boolean> => {
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (error) {
      console.warn('Clipboard copy failed:', error);
      return false;
    }
  };

  const handleInstagramShare = async () => {
    if (!result || !shareUrl) return;

    // 인스타그램 공유 추적
    await trackShare('instagram', result.slug);

    const text = `${result.name}\n${result.message}\n\n🎬 ${result.serial}번째 희망의 씨앗이 탄생했습니다!\n\n${shareUrl}`;
    const ogImageUrl = `${window.location.origin}/api/og?slug=${result.slug}`;

    try {
      // 1. Web Share API 사용 (모바일에서 네이티브 공유)
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        try {
          await navigator.share({
            title: `${result.name} | 희망의 씨앗 캠페인`,
            text: text,
            url: shareUrl
          });
          return;
        } catch (shareError) {
          console.log('Web Share API failed, trying alternative methods');
        }
      }

      // 2. 인스타그램 스토리 URL scheme 시도 (iOS/Android)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS || isAndroid) {
        // 텍스트를 클립보드에 복사
        const copySuccess = await safeCopyToClipboard(text);
        if (copySuccess) {
          toast.success('공유 텍스트가 복사되었습니다!');
        }

        // 인스타그램 앱 URL scheme으로 열기
        const instagramUrl = isIOS 
          ? 'instagram://camera' // iOS: 카메라/스토리 모드로 직접 열기
          : 'intent://share#Intent;package=com.instagram.android;scheme=https;end'; // Android

        // 인스타그램 앱 열기 시도
        window.location.href = instagramUrl;
        
        // 앱이 설치되지 않은 경우 대비 (3초 후 앱스토어로 이동)
        setTimeout(() => {
          const storeUrl = isIOS 
            ? 'https://apps.apple.com/app/instagram/id389801252'
            : 'https://play.google.com/store/apps/details?id=com.instagram.android';
          window.open(storeUrl, '_blank');
        }, 3000);

        toast.info('인스타그램 앱으로 이동합니다. 복사된 텍스트를 붙여넣으세요!');
        return;
      }

      // 3. 데스크톱 또는 기타 환경: 링크 복사 + 가이드
      const copySuccess = await safeCopyToClipboard(text);
      if (copySuccess) {
        toast.success('공유 텍스트가 복사되었습니다! 인스타그램에서 붙여넣으세요.');
      } else {
        toast.error('클립보드 복사에 실패했습니다. 텍스트를 수동으로 복사해주세요.');
      }
      
    } catch (error) {
      console.error('Instagram share failed:', error);
      toast.error('인스타그램 공유에 실패했습니다.');
    }
  };

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

          {/* 우측: 공유 옵션 */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                공유하기
              </h3>

              <div className="space-y-3">
                <Button 
                  onClick={handleKakaoShare}
                  className="w-full justify-start bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={sharing}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  카카오톡으로 공유
                </Button>

                <Button 
                  onClick={() => handleSocialShare('facebook')}
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  disabled={sharing}
                >
                  <Users className="w-4 h-4 mr-2" />
                  페이스북으로 공유
                </Button>

                <Button 
                  onClick={() => handleSocialShare('twitter')}
                  className="w-full justify-start bg-sky-500 hover:bg-sky-600"
                  disabled={sharing}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  트위터(X)로 공유
                </Button>

                <Button 
                  onClick={handleInstagramShare}
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
                  disabled={sharing}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  인스타그램에 공유하기
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <Copy className="w-5 h-5" />
                링크 공유
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-lg bg-muted/50 focus:outline-none"
                />
                <Button onClick={handleCopyLink} size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                이 링크를 통해 누구나 미디어팩을 볼 수 있습니다
              </p>
            </Card>

            <Card className="p-6 bg-warm-ivory/30">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-coral mt-1" />
                <div>
                  <h4 className="font-medium mb-1">감사합니다!</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    당신의 따뜻한 마음이 누군가에게는 큰 힘이 될 것입니다. 
                    더 많은 사람들과 이 미디어팩을 공유해주세요.
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