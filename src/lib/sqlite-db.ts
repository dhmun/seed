// lib/sqlite-db.ts
import sqlite3 from 'sqlite3';
import { join } from 'path';

/** ===== 타입 정의 ===== */
export type Content = {
  id: string;
  kind: 'movie' | 'drama' | 'show' | 'kpop' | 'doc';
  title: string;
  summary: string;
  thumbnail_url: string;
  size_mb: number;
  is_active: boolean;
  created_at: string;
  // TMDB 메타데이터 추가
  tmdb_id?: number;
  vote_average?: number;
  release_date?: string;
  genre_ids?: number[];
  popularity?: number;
};

export type Pack = {
  id: string;
  name: string;
  message: string;
  serial: number;
  share_slug: string;
  og_image_url: string | null;
  created_at: string;
};

export type PackItem = { pack_id: string; content_id: string; };
export type Message = { id: string; pack_id: string; body: string; created_at: string; };
export type Counter = { key: string; value: number; };

/** ===== SQLite 데이터베이스 설정 ===== */
const isServer = typeof window === 'undefined';
let _db: sqlite3.Database | null = null;

export function getDatabase(): sqlite3.Database {
  if (!isServer) {
    throw new Error('Database access is server-only');
  }
  
  if (_db) return _db;
  
  const dbPath = join(process.cwd(), 'data', 'local.db');
  
  // 데이터베이스 생성
  _db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('SQLite 데이터베이스 연결 실패:', err);
    } else {
      console.log('SQLite 데이터베이스 연결됨:', dbPath);
    }
  });
  
  // 테이블 초기화
  initializeTables();
  
  return _db;
}

function initializeTables() {
  if (!_db) return;
  
  const queries = [
    // contents 테이블
    `function initializeTables() {
  if (!_db) return;
  
  const queries = [
    // contents 테이블
    `CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('movie', 'drama', 'show', 'kpop', 'doc')),
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      size_mb REAL NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      tmdb_id INTEGER,
      vote_average REAL,
      release_date TEXT,
      genre_ids TEXT,
      popularity REAL,
      original_title TEXT,
      backdrop_url TEXT,
      tmdb_type TEXT,
      vote_count INTEGER,
      adult BOOLEAN,
      original_language TEXT,
      updated_at TEXT
    )`,
    
    // packs 테이블
    `CREATE TABLE IF NOT EXISTS packs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      serial INTEGER NOT NULL,
      share_slug TEXT NOT NULL UNIQUE,
      og_image_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // pack_items 테이블
    `CREATE TABLE IF NOT EXISTS pack_items (
      pack_id TEXT NOT NULL,
      content_id TEXT NOT NULL,
      PRIMARY KEY (pack_id, content_id),
      FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
    )`,
    
    // messages 테이블
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      pack_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
    )`,
    
    // counters 테이블
    `CREATE TABLE IF NOT EXISTS counters (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    )`,
    
    // share_events 테이블 (새로 추가)
    `CREATE TABLE IF NOT EXISTS share_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pack_slug TEXT NOT NULL,
      platform TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // pack_views 테이블 (새로 추가)
    `CREATE TABLE IF NOT EXISTS pack_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pack_slug TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ];
  
  queries.forEach(query => {
    _db!.run(query, (err) => {
      if (err) {
        console.error('테이블 생성 실패:', err);
      }
    });
  });
}`,
    
    // packs 테이블
    `CREATE TABLE IF NOT EXISTS packs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      serial INTEGER NOT NULL,
      share_slug TEXT NOT NULL UNIQUE,
      og_image_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // pack_items 테이블
    `CREATE TABLE IF NOT EXISTS pack_items (
      pack_id TEXT NOT NULL,
      content_id TEXT NOT NULL,
      PRIMARY KEY (pack_id, content_id),
      FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
    )`,
    
    // messages 테이블
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      pack_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
    )`,
    
    // counters 테이블
    `CREATE TABLE IF NOT EXISTS counters (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    )`
  ];
  
  queries.forEach(query => {
    _db!.run(query, (err) => {
      if (err) {
        console.error('테이블 생성 실패:', err);
      }
    });
  });
}

/** ===== 데이터베이스 쿼리 헬퍼 ===== */
export function runQuery(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery<T>(query: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

export function allQuery<T>(query: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

/** ===== 초기 데이터 삽입 ===== */
export async function insertSampleData() {
  try {
    // 샘플 콘텐츠 데이터
    const sampleContents: Content[] = [
      {
        id: '1',
        kind: 'movie',
        title: '기생충',
        summary: '반지하 가족의 기생, 전원백수로 살 길 막막하지만 사는 것은 즐거운 기택네 가족.',
        thumbnail_url: 'https://picsum.photos/400/600?random=1',
        size_mb: 2800,
        is_active: true,
        created_at: new Date().toISOString(),
        tmdb_id: 496243,
        vote_average: 8.5,
        release_date: '2019-05-30',
        genre_ids: [35, 53, 18],
        popularity: 85.2
      },
      {
        id: '2',
        kind: 'drama',
        title: '오징어 게임',
        summary: '한국의 전통 놀이를 소재로 한 서바이벌 스릴러 드라마',
        thumbnail_url: 'https://picsum.photos/400/600?random=2',
        size_mb: 1200,
        is_active: true,
        created_at: new Date().toISOString(),
        tmdb_id: 93405,
        vote_average: 8.0,
        release_date: '2021-09-17',
        genre_ids: [18, 53],
        popularity: 92.5
      },
      {
        id: '3',
        kind: 'show',
        title: '무한도전',
        summary: '예능계의 전설, 6명의 멤버가 펼치는 무한한 도전',
        thumbnail_url: 'https://picsum.photos/400/600?random=3',
        size_mb: 800,
        is_active: true,
        created_at: new Date().toISOString(),
        vote_average: 9.0,
        release_date: '2005-04-23',
        popularity: 75.3
      },
      {
        id: '4',
        kind: 'kpop',
        title: 'BTS - Dynamite',
        summary: 'BTS의 첫 영어 싱글, 빌보드 핫 100 1위를 차지한 명곡',
        thumbnail_url: 'https://picsum.photos/400/600?random=4',
        size_mb: 15,
        is_active: true,
        created_at: new Date().toISOString(),
        vote_average: 9.2,
        release_date: '2020-08-21',
        popularity: 98.7
      },
      {
        id: '5',
        kind: 'doc',
        title: '자유를 향한 여행',
        summary: '북한을 탈출하여 자유를 찾은 사람들의 이야기',
        thumbnail_url: 'https://picsum.photos/400/600?random=5',
        size_mb: 1500,
        is_active: true,
        created_at: new Date().toISOString(),
        vote_average: 8.3,
        release_date: '2022-03-15',
        popularity: 67.8
      }
    ];
    
    for (const content of sampleContents) {
      await runQuery(
        `INSERT OR IGNORE INTO contents 
         (id, kind, title, summary, thumbnail_url, size_mb, is_active, created_at, 
          tmdb_id, vote_average, release_date, genre_ids, popularity) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          content.id, content.kind, content.title, content.summary,
          content.thumbnail_url, content.size_mb, content.is_active,
          content.created_at, content.tmdb_id, content.vote_average,
          content.release_date, JSON.stringify(content.genre_ids), content.popularity
        ]
      );
    }
    
    console.log('샘플 데이터 삽입 완료');
  } catch (error) {
    console.error('샘플 데이터 삽입 실패:', error);
  }
}