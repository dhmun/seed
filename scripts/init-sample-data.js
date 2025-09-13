/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/init-sample-data.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'local.db');

// 샘플 콘텐츠 데이터 (기존 스키마에 맞춤)
const sampleContents = [
  {
    id: 'movie_001',
    kind: 'movie',
    title: '기생충',
    summary: '봉준호 감독의 아카데미 작품상 수상작. 반지하에 살던 기택 가족이 박 사장 가족에게 취업하면서 일어나는 예측불가능한 사건들을 그린 블랙 코미디.',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    size_mb: 4500,
    is_active: 1,
    tmdb_id: 496243,
    release_date: '2019-05-30',
    genre_ids: JSON.stringify([35, 53, 18]),
    vote_average: 8.5,
    popularity: 85.2
  },
  {
    id: 'movie_002',
    kind: 'movie',
    title: '미나리',
    summary: '1980년대 미국 아칸소에서 농장을 꾸려나가는 한국 이민자 가족의 아메리칸 드림을 그린 감동작.',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/6DKqCnTjg6oXlOhVKxGJ9OBhSXW.jpg',
    size_mb: 3800,
    is_active: 1,
    tmdb_id: 632727,
    release_date: '2020-12-11',
    genre_ids: JSON.stringify([18]),
    vote_average: 7.4,
    popularity: 72.8
  },
  {
    id: 'drama_001',
    kind: 'drama',
    title: '오징어 게임',
    summary: '어린 시절 놀이를 응용한 서바이벌 게임에 참가한 사람들이 거액의 상금을 두고 벌이는 극한의 경쟁을 그린 넷플릭스 오리지널 시리즈.',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
    size_mb: 12000,
    is_active: 1,
    tmdb_id: 93405,
    release_date: '2021-09-17',
    genre_ids: JSON.stringify([18, 9648, 53]),
    vote_average: 7.8,
    popularity: 95.5
  },
  {
    id: 'drama_002',
    kind: 'drama',
    title: '사랑의 불시착',
    summary: '북한에 불시착한 남한의 상속녀와 그녀를 숨겨주게 된 북한 특급 장교가 서로 사랑하게 되면서 벌어지는 이야기.',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/q5Ly6LlsHJjYPQDG3Iz2iEpCKUD.jpg',
    size_mb: 15600,
    is_active: 1,
    tmdb_id: 94796,
    release_date: '2019-12-14',
    genre_ids: JSON.stringify([35, 18, 10749]),
    vote_average: 8.7,
    popularity: 88.3
  },
  {
    id: 'show_001',
    kind: 'show',
    title: '유 퀴즈 온 더 블럭',
    summary: '유재석과 조세호가 함께하는 토크쇼. 거리로 나가 평범한 사람들의 특별한 이야기를 들어보는 프로그램.',
    thumbnail_url: 'https://via.placeholder.com/500x750?text=유퀴즈',
    size_mb: 2800,
    is_active: 1,
    tmdb_id: null,
    release_date: '2018-08-29',
    genre_ids: JSON.stringify([10767]),
    vote_average: 8.5,
    popularity: 78.9
  },
  {
    id: 'show_002',
    kind: 'show',
    title: '런닝맨',
    summary: '웃음과 재미가 가득한 게임 예능. 고정 멤버들과 게스트들이 함께 다양한 미션을 수행하는 프로그램.',
    thumbnail_url: 'https://via.placeholder.com/500x750?text=런닝맨',
    size_mb: 3200,
    is_active: 1,
    tmdb_id: null,
    release_date: '2010-07-11',
    genre_ids: JSON.stringify([10764]),
    vote_average: 7.9,
    popularity: 82.1
  },
  {
    id: 'kpop_001',
    kind: 'kpop',
    title: 'BTS - Dynamite',
    summary: '방탄소년단의 첫 영어 싱글곡. 전 세계를 사로잡은 디스코 팝 장르의 밝고 경쾌한 히트곡.',
    thumbnail_url: 'https://via.placeholder.com/500x750?text=BTS+Dynamite',
    size_mb: 150,
    is_active: 1,
    tmdb_id: null,
    release_date: '2020-08-21',
    genre_ids: JSON.stringify([10402]),
    vote_average: 9.2,
    popularity: 98.7
  },
  {
    id: 'kpop_002',
    kind: 'kpop',
    title: 'NewJeans - Get Up',
    summary: '4세대 대표 걸그룹 뉴진스의 히트곡. Y2K 감성과 현대적 사운드가 조화를 이룬 트렌디한 곡.',
    thumbnail_url: 'https://via.placeholder.com/500x750?text=NewJeans',
    size_mb: 120,
    is_active: 1,
    tmdb_id: null,
    release_date: '2023-07-21',
    genre_ids: JSON.stringify([10402]),
    vote_average: 8.8,
    popularity: 91.3
  },
  {
    id: 'doc_001',
    kind: 'doc',
    title: '나의 아름다운 정원',
    summary: '자연과 함께하는 힐링 다큐멘터리. 계절의 변화와 함께 변해가는 정원의 모습을 담은 감성적인 작품.',
    thumbnail_url: 'https://via.placeholder.com/500x750?text=나의아름다운정원',
    size_mb: 5200,
    is_active: 1,
    tmdb_id: null,
    release_date: '2023-03-15',
    genre_ids: JSON.stringify([99]),
    vote_average: 7.6,
    popularity: 65.4
  },
  {
    id: 'doc_002',
    kind: 'doc',
    title: '한국사 탐험',
    summary: '우리 역사를 재조명하는 교양 프로그램. 흥미진진한 역사적 사건들과 인물들의 이야기를 현대적 시각으로 재해석.',
    thumbnail_url: 'https://via.placeholder.com/500x750?text=한국사탐험',
    size_mb: 6800,
    is_active: 1,
    tmdb_id: null,
    release_date: '2023-01-10',
    genre_ids: JSON.stringify([99, 36]),
    vote_average: 8.1,
    popularity: 71.8
  }
];

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

function insertSampleData(db, contents) {
  return new Promise((resolve, reject) => {
    console.log('📦 기존 데이터 삭제 중...');
    
    // 기존 데이터 삭제
    db.run('DELETE FROM contents', (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('📝 샘플 데이터 삽입 중...');
      
      // 새 데이터 삽입 (기존 스키마에 맞춤)
      const stmt = db.prepare(`
        INSERT INTO contents (
          id, kind, title, summary, thumbnail_url, size_mb, is_active,
          tmdb_id, vote_average, release_date, genre_ids, popularity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let insertedCount = 0;
      
      contents.forEach((content) => {
        stmt.run([
          content.id, content.kind, content.title, content.summary,
          content.thumbnail_url, content.size_mb, content.is_active,
          content.tmdb_id, content.vote_average, content.release_date,
          content.genre_ids, content.popularity
        ], (err) => {
          if (err) {
            console.error('삽입 에러:', err.message);
          } else {
            insertedCount++;
          }
          
          if (insertedCount === contents.length) {
            stmt.finalize();
            resolve(insertedCount);
          }
        });
      });
    });
  });
}

async function main() {
  console.log('🚀 샘플 데이터 초기화를 시작합니다...\n');

  let db;
  
  try {
    // 데이터베이스 초기화
    db = await initializeDatabase();
    
    // 샘플 데이터 삽입
    const insertedCount = await insertSampleData(db, sampleContents);
    
    console.log(`✅ 성공! ${insertedCount}개의 샘플 콘텐츠가 SQLite DB에 저장되었습니다.`);
    console.log('\n📊 삽입된 콘텐츠:');
    
    sampleContents.forEach((content, index) => {
      console.log(`  ${index + 1}. [${content.kind.toUpperCase()}] ${content.title}`);
    });

  } catch (error) {
    console.error('\n❌ 초기화 중 오류가 발생했습니다:', error.message);
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