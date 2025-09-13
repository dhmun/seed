/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/fetch-tmdb-movies.js - 1000개 영화 데이터 수집

const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
const path = require('path');

// .env.local 파일의 환경 변수를 로드합니다.
require('dotenv').config({ path: '.env.local' });

// --- 설정 영역 ---
const TMDB_ACCESS_TOKEN = process.env.TMDB_API_ACCESS_TOKEN;
const DB_PATH = path.join(__dirname, '..', 'data', 'local.db');

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

const TARGET_MOVIE_COUNT = 1000;
const ITEMS_PER_PAGE = 20; // TMDB API 기본값
const PAGES_TO_FETCH = Math.ceil(TARGET_MOVIE_COUNT / ITEMS_PER_PAGE); // 50 페이지

console.log(`🎬 목표: ${TARGET_MOVIE_COUNT}개 영화 수집 (${PAGES_TO_FETCH} 페이지)`);

// --- 데이터베이스 초기화 ---
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('✅ SQLite 데이터베이스 연결 성공');
      resolve(db);
    });
  });
}

/**
 * TMDB에서 인기/최신 영화 데이터를 가져오는 함수
 * @param {string} endpoint - 'popular', 'top_rated', 'upcoming', 'now_playing'
 * @param {number} page - 페이지 번호
 */
async function fetchMoviesFromTMDB(endpoint = 'popular', page = 1) {
  const url = `${TMDB_API_BASE_URL}/movie/${endpoint}?language=ko-KR&page=${page}&region=KR`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
    }
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`  ❌ ${endpoint} 페이지 ${page} 로드 실패:`, error.message);
    return [];
  }
}

/**
 * 다양한 카테고리에서 영화 수집
 */
async function fetchDiverseMovies() {
  const categories = [
    'popular',      // 인기 영화
    'top_rated',    // 높은 평점
    'upcoming',     // 개봉 예정
    'now_playing'   // 현재 상영중
  ];

  let allMovies = [];
  let movieIds = new Set(); // 중복 제거용

  console.log('📡 다양한 카테고리에서 영화 수집 중...\n');

  for (const category of categories) {
    console.log(`🎭 ${category.toUpperCase()} 카테고리 수집 중...`);
    
    const pagesPerCategory = Math.ceil(PAGES_TO_FETCH / categories.length);
    
    for (let page = 1; page <= pagesPerCategory && allMovies.length < TARGET_MOVIE_COUNT; page++) {
      try {
        const movies = await fetchMoviesFromTMDB(category, page);
        
        // 중복 제거하면서 추가
        let addedCount = 0;
        for (const movie of movies) {
          if (!movieIds.has(movie.id) && allMovies.length < TARGET_MOVIE_COUNT) {
            movieIds.add(movie.id);
            allMovies.push(movie);
            addedCount++;
          }
        }
        
        console.log(`  - ${category} p.${page}: ${addedCount}개 추가 (총 ${allMovies.length}개)`);
        
        // API 제한 준수를 위한 지연 (250ms)
        await new Promise(resolve => setTimeout(resolve, 250));
        
      } catch (error) {
        console.error(`  ❌ ${category} p.${page} 에러:`, error.message);
      }
    }
  }
  
  console.log(`\n🎉 총 ${allMovies.length}개의 고유한 영화 수집 완료!`);
  return allMovies;
}

/**
 * TMDB 데이터를 우리 DB 스키마에 맞게 변환
 */
function transformMovieData(movie) {
  // 필수 필드 체크
  if (!movie.overview || !movie.poster_path || !movie.title) {
    return null;
  }

  // 성인 콘텐츠 제외
  if (movie.adult) {
    return null;
  }

  // 파일 크기 랜덤 생성 (영화: 2GB ~ 8GB)
  const size_mb = Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000;

  return {
    id: `movie_${movie.id}`, // 고유 ID 생성
    kind: 'movie',
    title: movie.title,
    summary: movie.overview.substring(0, 500), // 요약 길이 제한
    thumbnail_url: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`,
    size_mb: size_mb,
    is_active: 1,
    tmdb_id: movie.id,
    vote_average: movie.vote_average || 0,
    release_date: movie.release_date || null,
    genre_ids: JSON.stringify(movie.genre_ids || []),
    popularity: movie.popularity || 0
  };
}

/**
 * SQLite DB에 영화 데이터 삽입
 */
function insertMovies(db, movies) {
  return new Promise((resolve, reject) => {
    console.log('🗑️ 기존 영화 데이터 삭제 중...');
    
    // 기존 영화 데이터만 삭제 (다른 콘텐츠는 유지)
    db.run("DELETE FROM contents WHERE kind = 'movie'", (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('💾 새로운 영화 데이터 삽입 중...');
      
      const stmt = db.prepare(`
        INSERT INTO contents (
          id, kind, title, summary, thumbnail_url, size_mb, is_active,
          tmdb_id, vote_average, release_date, genre_ids, popularity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let insertedCount = 0;
      let errorCount = 0;
      
      movies.forEach((movie, index) => {
        stmt.run([
          movie.id, movie.kind, movie.title, movie.summary,
          movie.thumbnail_url, movie.size_mb, movie.is_active,
          movie.tmdb_id, movie.vote_average, movie.release_date,
          movie.genre_ids, movie.popularity
        ], (err) => {
          if (err) {
            console.error(`삽입 에러 [${index}]:`, err.message);
            errorCount++;
          } else {
            insertedCount++;
          }
          
          // 진행률 표시
          if ((insertedCount + errorCount) % 100 === 0) {
            console.log(`  📊 진행률: ${insertedCount + errorCount}/${movies.length} (성공: ${insertedCount}, 실패: ${errorCount})`);
          }
          
          if (insertedCount + errorCount === movies.length) {
            stmt.finalize();
            resolve({ insertedCount, errorCount });
          }
        });
      });
    });
  });
}

/**
 * 수집된 데이터 통계 출력
 */
function printStatistics(movies) {
  console.log('\n📊 수집된 데이터 통계:');
  console.log(`총 영화 수: ${movies.length}개`);
  
  // 평점별 분포
  const ratingRanges = {
    '9.0+': movies.filter(m => m.vote_average >= 9.0).length,
    '8.0-8.9': movies.filter(m => m.vote_average >= 8.0 && m.vote_average < 9.0).length,
    '7.0-7.9': movies.filter(m => m.vote_average >= 7.0 && m.vote_average < 8.0).length,
    '6.0-6.9': movies.filter(m => m.vote_average >= 6.0 && m.vote_average < 7.0).length,
    '6.0 미만': movies.filter(m => m.vote_average < 6.0).length
  };
  
  console.log('평점 분포:');
  Object.entries(ratingRanges).forEach(([range, count]) => {
    console.log(`  ${range}: ${count}개`);
  });
  
  // 연도별 분포 (최근 5년)
  const currentYear = new Date().getFullYear();
  const yearRanges = {};
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    yearRanges[year] = movies.filter(m => 
      m.release_date && new Date(m.release_date).getFullYear() === year
    ).length;
  }
  
  console.log('최근 5년 연도별 분포:');
  Object.entries(yearRanges).forEach(([year, count]) => {
    console.log(`  ${year}년: ${count}개`);
  });
}

// --- 메인 실행 함수 ---
async function main() {
  console.log('🚀 TMDB 영화 데이터 대규모 수집을 시작합니다!\n');

  // 환경 변수 체크
  if (!TMDB_ACCESS_TOKEN) {
    console.error('❌ TMDB_API_ACCESS_TOKEN 환경변수가 설정되지 않았습니다.');
    console.log('💡 .env.local 파일에 TMDB API 토큰을 설정해주세요.');
    return;
  }

  let db;
  
  try {
    // 1. 데이터베이스 초기화
    db = await initializeDatabase();
    
    // 2. TMDB에서 다양한 영화 데이터 수집
    const rawMovies = await fetchDiverseMovies();
    
    if (rawMovies.length === 0) {
      console.log('⚠️ 수집된 영화 데이터가 없습니다.');
      return;
    }
    
    // 3. 데이터 변환 및 필터링
    console.log('\n🔄 데이터 변환 및 정제 중...');
    const transformedMovies = rawMovies
      .map(movie => transformMovieData(movie))
      .filter(Boolean); // null 제거

    console.log(`✅ ${transformedMovies.length}개의 유효한 영화 데이터 변환 완료`);

    if (transformedMovies.length === 0) {
      console.log('⚠️ 변환된 유효한 영화 데이터가 없습니다.');
      return;
    }

    // 4. 통계 출력
    printStatistics(transformedMovies);

    // 5. SQLite에 데이터 삽입
    console.log('\n💾 SQLite DB에 영화 데이터 저장 중...');
    const result = await insertMovies(db, transformedMovies);
    
    console.log(`\n🎉 성공! ${result.insertedCount}개의 영화가 데이터베이스에 저장되었습니다.`);
    if (result.errorCount > 0) {
      console.log(`⚠️ ${result.errorCount}개 항목에서 오류가 발생했습니다.`);
    }
    
    console.log('\n🎬 추천 영화 미리보기:');
    const topMovies = transformedMovies
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 5);
    
    topMovies.forEach((movie, index) => {
      console.log(`  ${index + 1}. ${movie.title} (⭐${movie.vote_average})`);
    });

  } catch (error) {
    console.error('\n❌ 데이터 수집 중 오류가 발생했습니다:', error.message);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('DB 연결 종료 에러:', err.message);
        } else {
          console.log('\n📦 SQLite 데이터베이스 연결 종료');
        }
      });
    }
  }
}

// 스크립트 실행
main();