/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/sync-tmdb.js

// Supabase 클라이언트와 node-fetch를 가져옵니다.
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// .env.local 파일의 환경 변수를 로드합니다.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// --- 설정 영역 ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_API_ACCESS_TOKEN;

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // w500은 이미지 크기
const PAGES_TO_FETCH = 50; // 가져올 페이지 수 (1페이지 당 20개, 50페이지 = 1000개)
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280'; // 배경 이미지용

// Supabase 클라이언트 초기화 (서비스 키 사용)
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// --- 헬퍼 함수 ---

/**
 * TMDb에서 여러 페이지의 인기 영화/드라마 정보를 가져오는 함수
 * @param {'movie' | 'tv'} type - 가져올 콘텐츠 타입
 */
async function fetchMultiplePages(type) {
  let allResults = [];
  console.log(`📡 ${type === 'movie' ? '영화' : 'TV'} 데이터 가져오는 중 (총 ${PAGES_TO_FETCH} 페이지)...
`);

  for (let page = 1; page <= PAGES_TO_FETCH; page++) {
    const url = `${TMDB_API_BASE_URL}/${type}/popular?language=ko-KR&page=${page}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
      }
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`  - ${page}페이지 로드 실패: ${response.statusText}`);
      continue; // 한 페이지 실패 시 다음 페이지로 넘어감
    }

    const data = await response.json();
    allResults.push(...data.results);
    console.log(`  - ${page}페이지 로드 완료 (현재까지 ${allResults.length}개)`);

    // API 제한 준수를 위한 지연
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  console.log(`✅ ${type === 'movie' ? '영화' : 'TV'} ${allResults.length}개 수집 완료`);
  return allResults;
}

/**
 * 특정 장르의 콘텐츠를 가져오는 함수
 * @param {'movie' | 'tv'} type - 가져올 콘텐츠 타입
 * @param {number} genreId - 장르 ID (99=다큐멘터리, 10764=Reality, 10767=Talk)
 * @param {number} pages - 가져올 페이지 수
 */
async function fetchByGenre(type, genreId, pages = 10) {
  let allResults = [];
  const genreName = genreId === 99 ? '다큐멘터리' : '예능';
  console.log(`📡 ${genreName} (${type}) 데이터 가져오는 중 (총 ${pages} 페이지)...`);

  for (let page = 1; page <= pages; page++) {
    const url = `${TMDB_API_BASE_URL}/discover/${type}?with_genres=${genreId}&language=ko-KR&page=${page}&sort_by=popularity.desc`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
      }
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`  - ${page}페이지 로드 실패: ${response.statusText}`);
      continue;
    }

    const data = await response.json();
    allResults.push(...data.results);
    console.log(`  - ${page}페이지 로드 완료 (현재까지 ${allResults.length}개)`);

    // API 제한 준수를 위한 지연
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  console.log(`✅ ${genreName} (${type}) ${allResults.length}개 수집 완료`);
  return allResults;
}

/**
 * TMDb 데이터를 우리 DB 스키마에 맞게 변환하는 함수
 * @param {object} item - TMDb의 개별 영화/드라마 객체
 * @param {'movie' | 'tv'} tmdb_type - TMDb 타입
 */
function transformData(item, tmdb_type) {
  // 줄거리나 포스터가 없는 데이터는 제외
  if (!item.overview || !item.poster_path) {
    return null;
  }

  // 성인 콘텐츠 제외
  if (item.adult) {
    return null;
  }

  // kind 결정 로직
  let kind;
  const genreIds = item.genre_ids || [];

  // 1. 다큐멘터리 체크 (영화/TV 모두 장르 ID 99)
  const isDocumentary = genreIds.includes(99);
  if (isDocumentary) {
    kind = 'doc';
  } else if (tmdb_type === 'movie') {
    // 2. 영화
    kind = 'movie';
  } else {
    // 3. TV 프로그램의 경우 장르로 구분
    // TMDb TV 장르 ID: 10764(Reality), 10767(Talk)
    const varietyGenres = [10764, 10767]; // Reality, Talk Show
    const isVarietyShow = varietyGenres.some(id => genreIds.includes(id));

    kind = isVarietyShow ? 'show' : 'drama';
  }

  // TMDb에는 파일 크기 정보가 없으므로, 현실적인 가상 용량을 랜덤으로 생성합니다.
  const size_mb = kind === 'movie'
    ? Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000 // 영화: 3GB ~ 8GB
    : Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000; // 드라마/예능: 10GB ~ 20GB

  // ID 생성: tmdb_type-tmdb_id 형식 (예: tv-12345)
  const id = `${tmdb_type}-${item.id}`;

  return {
    id: id,
    kind: kind,
    title: item.title || item.name,
    original_title: item.original_title || item.original_name,
    summary: item.overview,
    thumbnail_url: `${TMDB_IMAGE_BASE_URL}${item.poster_path}`,
    backdrop_url: item.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${item.backdrop_path}` : null,
    size_mb: size_mb,
    is_active: true,
    tmdb_id: item.id,
    tmdb_type: tmdb_type,
    release_date: item.release_date || item.first_air_date || null,
    genre_ids: item.genre_ids || [],
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    popularity: item.popularity || 0,
    adult: item.adult || false,
    original_language: item.original_language || 'en'
  };
}

/**
 * Mock 모드를 위한 JSON 파일 생성 함수
 */
function generateMockData(allContents) {
  const mockData = allContents.map((content, index) => ({
    id: (index + 1).toString(),
    ...content,
    created_at: new Date().toISOString()
  }));

  console.log('📝 Mock 데이터 샘플을 콘솔에 출력합니다:');
  console.log('// src/server/actions/contents.ts 파일의 mockContents 배열을 아래 데이터로 교체하세요');
  console.log('const mockContents: Content[] = [');
  
  mockData.slice(0, 100).forEach((content, index) => {
    console.log(`  {
    id: '${content.id}',
    kind: '${content.kind}',
    title: '${content.title.replace(/'/g, "'\''").replace(/"/g, '\"')}',
    summary: '${content.summary.replace(/'/g, "'\''").replace(/"/g, '\"')}',
    thumbnail_url: '${content.thumbnail_url}',
    size_mb: ${content.size_mb},
    is_active: true,
    created_at: '${content.created_at}'
  }${index < 99 ? ',' : ''}`);
  });
  
  console.log('];');
  console.log(`\n📊 총 ${mockData.length}개의 실제 TMDb 데이터가 준비되었습니다!`);
}

// --- 메인 실행 함수 ---
async function main() {
  console.log('🚀 TMDb 데이터 동기화를 시작합니다...\n');

  // 환경 변수 체크
  if (!TMDB_ACCESS_TOKEN) {
    console.error('❌ TMDB_API_ACCESS_TOKEN 환경변수가 설정되지 않았습니다.');
    console.log('💡 .env.local 파일에 다음을 추가해주세요:');
    console.log('   TMDB_API_ACCESS_TOKEN=your_tmdb_access_token');
    console.log('💡 TMDb API 토큰은 https://www.themoviedb.org/settings/api 에서 발급받을 수 있습니다.');
    return;
  }

  try {
    // 1. 인기 영화 가져오기 (50페이지 = 1000개)
    console.log('\n🎬 영화 데이터 수집 시작...');
    const movies = await fetchMultiplePages('movie');

    // 2. 인기 TV 프로그램(드라마/예능) 가져오기 (50페이지 = 1000개)
    console.log('\n📺 TV 프로그램 데이터 수집 시작...');
    const tvShows = await fetchMultiplePages('tv');

    // 3. 다큐멘터리 직접 검색 (영화 + TV, 10페이지씩 = 400개)
    console.log('\n📽️ 다큐멘터리 직접 검색 시작...');
    const movieDocs = await fetchByGenre('movie', 99, 10);
    const tvDocs = await fetchByGenre('tv', 99, 10);

    // 4. 예능 직접 검색 (Reality + Talk Show, 10페이지씩 = 400개)
    console.log('\n🎭 예능 프로그램 직접 검색 시작...');
    const realityShows = await fetchByGenre('tv', 10764, 10); // Reality
    const talkShows = await fetchByGenre('tv', 10767, 10); // Talk Show

    console.log(`\n✅ 수집 완료:`);
    console.log(`   - 영화: ${movies.length}개`);
    console.log(`   - TV 프로그램: ${tvShows.length}개`);
    console.log(`   - 다큐멘터리 (영화): ${movieDocs.length}개`);
    console.log(`   - 다큐멘터리 (TV): ${tvDocs.length}개`);
    console.log(`   - 리얼리티 쇼: ${realityShows.length}개`);
    console.log(`   - 토크쇼: ${talkShows.length}개`);

    // 5. 우리 DB 스키마에 맞게 데이터 변환
    console.log('\n🔄 데이터 변환 중...');
    const transformedMovies = movies.map(movie => transformData(movie, 'movie')).filter(Boolean);
    const transformedTvShows = tvShows.map(show => transformData(show, 'tv')).filter(Boolean);
    const transformedMovieDocs = movieDocs.map(doc => transformData(doc, 'movie')).filter(Boolean);
    const transformedTvDocs = tvDocs.map(doc => transformData(doc, 'tv')).filter(Boolean);
    const transformedReality = realityShows.map(show => transformData(show, 'tv')).filter(Boolean);
    const transformedTalk = talkShows.map(show => transformData(show, 'tv')).filter(Boolean);

    // 통계 출력 (모든 콘텐츠를 합쳐서 kind별로 카운트)
    const allContentsTemp = [
      ...transformedMovies,
      ...transformedTvShows,
      ...transformedMovieDocs,
      ...transformedTvDocs,
      ...transformedReality,
      ...transformedTalk
    ];
    const movieCount = allContentsTemp.filter(c => c.kind === 'movie').length;
    const dramaCount = allContentsTemp.filter(c => c.kind === 'drama').length;
    const showCount = allContentsTemp.filter(c => c.kind === 'show').length;
    const docCount = allContentsTemp.filter(c => c.kind === 'doc').length;

    console.log(`   - 영화: ${movieCount}개`);
    console.log(`   - 드라마: ${dramaCount}개`);
    console.log(`   - 예능: ${showCount}개`);
    console.log(`   - 다큐멘터리: ${docCount}개`);

    const allContents = [
      ...transformedMovies,
      ...transformedTvShows,
      ...transformedMovieDocs,
      ...transformedTvDocs,
      ...transformedReality,
      ...transformedTalk
    ];

    // 중복 ID 제거 (동일한 ID가 여러 번 나타나는 경우 첫 번째만 유지)
    const uniqueContents = [];
    const seenIds = new Set();
    for (const content of allContents) {
      if (!seenIds.has(content.id)) {
        seenIds.add(content.id);
        uniqueContents.push(content);
      }
    }

    console.log(`\n✅ 총 ${uniqueContents.length}개의 유효한 콘텐츠 변환 완료 (중복 제거: ${allContents.length - uniqueContents.length}개)`);

    if (uniqueContents.length === 0) {
      console.log('⚠️ 동기화할 새로운 콘텐츠가 없습니다.');
      return;
    }

    // 4. Supabase 연결 여부에 따라 처리 분기
    if (supabase && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      console.log('\n📡 Supabase에 데이터 업로드 중...');

      // upsert를 사용하여 데이터 삽입/업데이트 (중복 시 업데이트)
      console.log('- 데이터 업서트 중 (중복 시 업데이트)...');
      const { error: upsertError } = await supabase
        .from('contents')
        .upsert(uniqueContents, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      console.log(`✅ 성공! ${uniqueContents.length}개의 콘텐츠가 Supabase DB에 동기화되었습니다.`);
    } else {
      console.log('\n⚠️  Supabase 환경변수가 설정되지 않아 Mock 모드로 실행합니다.');
      generateMockData(allContents);
    }

  } catch (error) {
    console.error('\n❌ 동기화 중 오류가 발생했습니다:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 TMDb API 토큰이 유효하지 않습니다. 토큰을 확인해주세요.');
    }
  }
}

// 스크립트 실행
main();

// --- 추가: 모든 TMDb 데이터 텍스트 파일로 저장 ---
async function saveAllTmdbData() {
  const movies = await fetchMultiplePages('movie');
  const dramas = await fetchMultiplePages('tv');
  const allData = { movies, dramas };
  fs.writeFileSync('all_tmdb_data.txt', JSON.stringify(allData, null, 2));
  console.log('\n📝 모든 TMDb 데이터를 all_tmdb_data.txt 파일에 저장했습니다.');
}

// `node scripts/sync-tmdb.js --save` 실행 시 모든 데이터 저장
if (process.argv.includes('--save')) {
  saveAllTmdbData();
}
