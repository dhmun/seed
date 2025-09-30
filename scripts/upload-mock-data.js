// Mock 데이터를 Supabase로 업로드하는 스크립트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Mock 데이터 (contents.ts에서 가져온 것)
const mockContents = [
  // URL에서 사용되는 ID들을 위한 데이터
  {
    id: 'movie_755898',
    kind: 'movie',
    title: '라이온 킹',
    summary: '자연계의 법칙에 따라 만물의 왕인 사자 무파사의 아들 심바가 아버지의 왕좌를 이어받기 위해 성장하는 과정을 그린 디즈니 애니메이션',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
    size_mb: 4200,
    is_active: true,
    created_at: '2025-09-04T21:25:24.291Z'
  },
  {
    id: 'movie_1311031',
    kind: 'movie',
    title: '모아나 2',
    summary: '모아나와 마우이가 새로운 모험을 떠나는 디즈니의 속편 애니메이션. 바다 너머 새로운 섬들을 탐험하며 더 큰 위험에 맞서게 된다.',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/4YZpsylmjHbqeWzjKpUEF8gcLNW.jpg',
    size_mb: 3850,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: 'tv_119051',
    kind: 'drama',
    title: '수요일',
    summary: '아담스 패밀리의 딸 웬즈데이 아담스가 네버모어 아카데미에서 겪는 미스터리와 성장을 그린 넷플릭스 오리지널 시리즈',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    size_mb: 5200,
    is_active: true,
    created_at: '2025-09-04T21:25:24.293Z'
  },
  {
    id: 'movie_506763',
    kind: 'movie',
    title: '샹치와 텐 링즈의 전설',
    summary: '마블 시네마틱 유니버스의 새로운 영웅 샹치가 아버지의 과거와 맞서며 자신의 운명을 찾아가는 액션 어드벤처',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/xeItgLjkoata9YKs3kH0mp5cuKB.jpg',
    size_mb: 4500,
    is_active: true,
    created_at: '2025-09-04T21:25:24.294Z'
  },
  {
    id: 'tv_157239',
    kind: 'drama',
    title: '더 베어',
    summary: '시카고의 이탈리아계 미국인 쇠고기 샌드위치 레스토랑을 배경으로 한 요리사들의 이야기를 그린 코미디 드라마',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/xm1LY6NpPE8NUu8BnSjlKl8JNQX.jpg',
    size_mb: 3200,
    is_active: true,
    created_at: '2025-09-04T21:25:24.295Z'
  },
  {
    id: 'movie_911430',
    kind: 'movie',
    title: '바빌론',
    summary: '1920년대 할리우드를 배경으로 영화 산업의 과도기를 겪는 배우들과 제작진들의 이야기를 그린 드라마',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/wjOHjWCUE0YzDiEzKv8AfqHj3ir.jpg',
    size_mb: 6800,
    is_active: true,
    created_at: '2025-09-04T21:25:24.296Z'
  },
  // 추가 영화 데이터
  {
    id: '1',
    kind: 'movie',
    title: '우주전쟁',
    summary: '전설적인 동명 소설을 새롭게 재해석한 이번 작품은 거대한 침공의 서막을 알린다.',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg',
    size_mb: 3763,
    is_active: true,
    created_at: '2025-09-04T21:25:24.291Z'
  },
  {
    id: '2',
    kind: 'movie',
    title: 'F1 더 무비',
    summary: '한때 주목받는 유망주였지만 끔찍한 사고로 F1®에서 우승하지 못하고 한순간에 추락한 드라이버 소니 헤이스의 이야기',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/p6t8zioyQSWHCt0GRnRgsQrb8zx.jpg',
    size_mb: 7856,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  }
];

async function uploadMockData() {
  console.log('🚀 Mock 데이터 업로드 시작...');
  console.log(`📊 총 ${mockContents.length}개 콘텐츠 업로드 예정`);

  try {
    // 1. 기존 데이터 확인
    console.log('\n1. 기존 데이터 확인 중...');
    const { data: existingData, error: fetchError } = await supabase
      .from('contents')
      .select('id');

    if (fetchError) {
      console.error('❌ 기존 데이터 조회 실패:', fetchError.message);
      return;
    }

    const existingIds = new Set(existingData?.map(item => item.id) || []);
    console.log(`📋 기존 데이터: ${existingIds.size}개`);

    // 2. 중복 제거 및 새 데이터 필터링
    const newContents = mockContents.filter(content => !existingIds.has(content.id));
    console.log(`🆕 새로 추가할 데이터: ${newContents.length}개`);

    if (newContents.length === 0) {
      console.log('✅ 모든 데이터가 이미 존재합니다.');
      return;
    }

    // 3. 배치 업로드 (Supabase는 한 번에 최대 1000개 지원)
    const batchSize = 100;
    let uploaded = 0;

    for (let i = 0; i < newContents.length; i += batchSize) {
      const batch = newContents.slice(i, i + batchSize);

      console.log(`\n📤 배치 ${Math.floor(i/batchSize) + 1} 업로드 중... (${batch.length}개)`);

      const { data, error } = await supabase
        .from('contents')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`❌ 배치 ${Math.floor(i/batchSize) + 1} 업로드 실패:`, error.message);
        console.error('상세 오류:', error);
        continue;
      }

      uploaded += data?.length || 0;
      console.log(`✅ 배치 ${Math.floor(i/batchSize) + 1} 완료: ${data?.length || 0}개 업로드`);
    }

    // 4. 결과 확인
    console.log('\n📊 업로드 완료!');
    console.log(`✅ 성공적으로 업로드된 항목: ${uploaded}개`);

    // 5. 최종 데이터 확인
    const { data: finalData, error: finalError } = await supabase
      .from('contents')
      .select('id, title, kind')
      .order('created_at', { ascending: false })
      .limit(10);

    if (finalError) {
      console.error('❌ 최종 확인 실패:', finalError.message);
    } else {
      console.log('\n🎉 최근 업로드된 콘텐츠 (최대 10개):');
      console.table(finalData?.map(item => ({
        ID: item.id,
        제목: item.title,
        종류: item.kind
      })) || []);
    }

  } catch (error) {
    console.error('❌ 업로드 중 오류 발생:', error.message);
  }
}

// 실행
uploadMockData();