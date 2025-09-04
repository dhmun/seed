import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getPackBySlug } from '@/server/actions/packs';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    // 미디어팩 데이터 가져오기
    const pack = await getPackBySlug(slug);

    if (!pack) {
      return new Response('Pack not found', { status: 404 });
    }

    // 썸네일 URL들 (최대 4개)
    const thumbnails = pack.contents.slice(0, 4).map(content => content.thumbnail_url);

    // Gowun Dodum 폰트 로드
    const fontData = await fetch(
      new URL('https://fonts.gstatic.com/s/gowundodum/v13/3Jn5SD_-ynaxmxnEfVHPIGXeSvqOXuE.woff2', import.meta.url),
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            backgroundColor: '#F8F7F2',
            backgroundImage: 'linear-gradient(45deg, #3B82F6 0%, #14B8A6 100%)',
            backgroundSize: '100% 200px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top',
          }}
        >
          {/* 좌측: 썸네일 모자이크 */}
          <div
            style={{
              flex: 2,
              display: 'flex',
              flexDirection: 'column',
              padding: '40px',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '12px',
                height: '100%',
                maxHeight: '550px',
              }}
            >
              {thumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={thumbnail}
                    alt={`Content ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
              
              {/* 빈 공간이 있으면 플레이스홀더 */}
              {Array.from({ length: 4 - thumbnails.length }).map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '16px',
                    color: '#9CA3AF',
                    fontSize: '24px',
                    fontWeight: 'bold',
                  }}
                >
                  🎬
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 텍스트 정보 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '60px 40px',
              backgroundColor: 'rgba(248, 247, 242, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* 상단: 미디어팩 정보 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 브랜드 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#3B82F6',
                    fontWeight: '500',
                  }}
                >
                  ✨ 희망의 씨앗 캠페인
                </div>
              </div>

              {/* 미디어팩 이름 */}
              <h1
                style={{
                  fontSize: '42px',
                  fontWeight: '700',
                  color: '#0F172A',
                  lineHeight: '1.2',
                  marginBottom: '20px',
                  fontFamily: 'Gowun Dodum',
                }}
              >
                {pack.name}
              </h1>

              {/* 메시지 */}
              <p
                style={{
                  fontSize: '22px',
                  color: '#334155',
                  lineHeight: '1.4',
                  marginBottom: '32px',
                  fontWeight: '400',
                }}
              >
                "{pack.message}"
              </p>
            </div>

            {/* 하단: 메타 정보 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 시리얼 번호 */}
              <div
                style={{
                  fontSize: '24px',
                  color: '#F87171',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🌱 {pack.serial}번째 희망의 씨앗
              </div>

              {/* 콘텐츠 수 */}
              <div
                style={{
                  fontSize: '16px',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                📦 {pack.contents.length}개 콘텐츠 포함
              </div>

              {/* 구분선 */}
              <div
                style={{
                  width: '80px',
                  height: '4px',
                  backgroundColor: '#14B8A6',
                  borderRadius: '2px',
                  marginTop: '8px',
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Gowun Dodum',
            data: fontData,
            style: 'normal',
          },
        ],
      },
    );
  } catch (e) {
    console.error('OG Image generation error:', e);
    return new Response(`Failed to generate OG image: ${e}`, {
      status: 500,
    });
  }
}