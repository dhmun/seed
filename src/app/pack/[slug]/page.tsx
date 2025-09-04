import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Calendar,
  Package,
  Sparkles,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { getPackBySlug } from '@/server/actions/packs';
import { formatFileSize, getContentKindLabel } from '@/lib/validations';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 메타데이터 생성 (동적 OG 이미지 포함)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);

  if (!pack) {
    return {
      title: '미디어팩을 찾을 수 없습니다 | 희망의 씨앗 캠페인',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ogImageUrl = `${baseUrl}/api/og?slug=${slug}`;

  return {
    title: `${pack.name} | 희망의 씨앗 캠페인`,
    description: `"${pack.message}" - ${pack.serial}번째 희망의 씨앗`,
    openGraph: {
      title: pack.name,
      description: pack.message,
      type: 'website',
      url: `${baseUrl}/pack/${slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: pack.name,
        },
      ],
      locale: 'ko_KR',
      siteName: '희망의 씨앗 캠페인',
    },
    twitter: {
      card: 'summary_large_image',
      title: pack.name,
      description: pack.message,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/pack/${slug}`,
    },
  };
}

export default async function PackPage({ params }: PageProps) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);

  if (!pack) {
    notFound();
  }

  const totalSizeMB = pack.contents.reduce((sum, content) => sum + content.size_mb, 0);
  const createdAt = new Date(pack.created_at);

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>

        {/* 미디어팩 정보 */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary-blue text-white px-4 py-2">
            <Sparkles className="w-4 h-4 mr-1" />
            {pack.serial}번째 희망의 씨앗
          </Badge>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {pack.name}
          </h1>
          
          <div className="max-w-2xl mx-auto mb-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              "{pack.message}"
            </p>
          </div>

          {/* 메타 정보 */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {createdAt.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {pack.contents.length}개 콘텐츠
            </div>
            <div className="flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              {formatFileSize(totalSizeMB)}
            </div>
          </div>
        </div>

        {/* 콘텐츠 그리드 */}
        <div className="mb-12">
          <h2 className="text-2xl font-heading font-bold mb-6 text-center">
            선택된 콘텐츠
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pack.contents.map((content) => (
              <Card key={content.id} className="p-4 hover:shadow-lg transition-all duration-300">
                {/* 썸네일 */}
                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-3">
                  <Image
                    src={content.thumbnail_url}
                    alt={content.title}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* 콘텐츠 정보 */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm line-clamp-2">{content.title}</h3>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0">
                      {getContentKindLabel(content.kind)}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {content.summary}
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(content.size_mb)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 감사 메시지 */}
        <Card className="p-8 text-center bg-gradient-to-br from-primary-blue/5 to-mint/5 border-primary-blue/20">
          <Heart className="w-12 h-12 text-coral mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold mb-4">
            따뜻한 마음에 감사합니다
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
            이 미디어팩은 누군가에게 위로와 힘이 되는 소중한 선물입니다. 
            당신의 선택이 만들어낸 희망의 씨앗이 더 많은 곳에 퍼져나가길 바랍니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/builder">
              <Button size="lg" className="bg-primary-blue hover:bg-primary-blue/90">
                <Sparkles className="w-4 h-4 mr-2" />
                나도 미디어팩 만들기
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" size="lg">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </Card>

        {/* 공유 안내 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            이 페이지를 SNS에 공유하면 미리보기 이미지와 함께 공유됩니다
          </p>
        </div>
      </div>
    </main>
  );
}