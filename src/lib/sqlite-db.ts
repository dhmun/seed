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
  
  // 각 SQL 쿼리를 별도의 상수로 정의 (Turbopack 파싱 이슈 해결)
  const createContentsTable = `CREATE TABLE IF NOT EXISTS contents (
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
  )`;
  
  const createPacksTable = `CREATE TABLE IF NOT EXISTS packs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    serial INTEGER NOT NULL,
    share_slug TEXT NOT NULL UNIQUE,
    og_image_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`;
  
  const createPackItemsTable = `CREATE TABLE IF NOT EXISTS pack_items (
    pack_id TEXT NOT NULL,
    content_id TEXT NOT NULL,
    PRIMARY KEY (pack_id, content_id),
    FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
  )`;
  
  const createMessagesTable = `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    pack_id TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
  )`;
  
  const createCountersTable = `CREATE TABLE IF NOT EXISTS counters (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
  )`;
  
  const createShareEventsTable = `CREATE TABLE IF NOT EXISTS share_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_slug TEXT NOT NULL,
    platform TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`;
  
  const createPackViewsTable = `CREATE TABLE IF NOT EXISTS pack_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_slug TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`;
  
  const queries = [
    createContentsTable,
    createPacksTable,
    createPackItemsTable,
    createMessagesTable,
    createCountersTable,
    createShareEventsTable,
    createPackViewsTable
  ];
  
  queries.forEach(query => {
    _db!.run(query, (err) => {
      if (err) {
        console.error('테이블 생성 실패:', err);
      }
    });
  });
}

/** ===== 데이터베이스 유틸리티 함수들 ===== */

// 단일 쿼리 실행 (SELECT)
export function getQuery<T>(sql: string, params: any[] = []): Promise<T | null> {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T || null);
      }
    });
  });
}

// 여러 행 쿼리 실행 (SELECT)
export function getAllQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

// 쓰기 쿼리 실행 (INSERT, UPDATE, DELETE)
export function runQuery(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

/** ===== 컨텐츠 관련 함수들 ===== */

export async function getAllContents(): Promise<Content[]> {
  return getAllQuery<Content>('SELECT * FROM contents WHERE is_active = 1 ORDER BY created_at DESC');
}

export async function getContentById(id: string): Promise<Content | null> {
  return getQuery<Content>('SELECT * FROM contents WHERE id = ? AND is_active = 1', [id]);
}

export async function getContentsByKind(kind: Content['kind']): Promise<Content[]> {
  return getAllQuery<Content>('SELECT * FROM contents WHERE kind = ? AND is_active = 1 ORDER BY created_at DESC', [kind]);
}

export async function getContentsWithPagination(page: number = 1, limit: number = 20, kind?: Content['kind']): Promise<{
  contents: Content[];
  total: number;
  hasMore: boolean;
}> {
  const offset = (page - 1) * limit;
  
  let sql = 'SELECT * FROM contents WHERE is_active = 1';
  let countSql = 'SELECT COUNT(*) as count FROM contents WHERE is_active = 1';
  let params: any[] = [];
  
  if (kind) {
    sql += ' AND kind = ?';
    countSql += ' AND kind = ?';
    params.push(kind);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const [contents, countResult] = await Promise.all([
    getAllQuery<Content>(sql, params),
    getQuery<{count: number}>(countSql, kind ? [kind] : [])
  ]);
  
  const total = countResult?.count || 0;
  const hasMore = offset + contents.length < total;
  
  return { contents, total, hasMore };
}

export async function searchContents(searchTerm: string): Promise<Content[]> {
  const sql = `
    SELECT * FROM contents 
    WHERE (title LIKE ? OR summary LIKE ?) 
    AND is_active = 1 
    ORDER BY popularity DESC, created_at DESC
  `;
  return getAllQuery<Content>(sql, [`%${searchTerm}%`, `%${searchTerm}%`]);
}

export async function insertContent(content: Omit<Content, 'created_at'>): Promise<void> {
  const sql = `
    INSERT INTO contents (
      id, kind, title, summary, thumbnail_url, size_mb, is_active,
      tmdb_id, vote_average, release_date, genre_ids, popularity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await runQuery(sql, [
    content.id,
    content.kind,
    content.title,
    content.summary,
    content.thumbnail_url,
    content.size_mb,
    content.is_active ? 1 : 0,
    content.tmdb_id || null,
    content.vote_average || null,
    content.release_date || null,
    content.genre_ids ? JSON.stringify(content.genre_ids) : null,
    content.popularity || null
  ]);
}

/** ===== 팩 관련 함수들 ===== */

export async function getPackBySlug(slug: string): Promise<Pack | null> {
  return getQuery<Pack>('SELECT * FROM packs WHERE share_slug = ?', [slug]);
}

export async function getPackContents(packId: string): Promise<Content[]> {
  const sql = `
    SELECT c.* FROM contents c
    INNER JOIN pack_items pi ON c.id = pi.content_id
    WHERE pi.pack_id = ? AND c.is_active = 1
    ORDER BY c.created_at DESC
  `;
  return getAllQuery<Content>(sql, [packId]);
}

export async function insertPack(pack: Omit<Pack, 'created_at'>): Promise<void> {
  const sql = `
    INSERT INTO packs (id, name, message, serial, share_slug, og_image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  await runQuery(sql, [
    pack.id,
    pack.name,
    pack.message,
    pack.serial,
    pack.share_slug,
    pack.og_image_url
  ]);
}

export async function insertPackItems(packId: string, contentIds: string[]): Promise<void> {
  const sql = 'INSERT INTO pack_items (pack_id, content_id) VALUES (?, ?)';
  
  for (const contentId of contentIds) {
    await runQuery(sql, [packId, contentId]);
  }
}

/** ===== 카운터 관련 함수들 ===== */

export async function getCounter(key: string): Promise<number> {
  const result = await getQuery<Counter>('SELECT value FROM counters WHERE key = ?', [key]);
  return result?.value || 0;
}

export async function incrementCounter(key: string): Promise<number> {
  const sql = `
    INSERT INTO counters (key, value) VALUES (?, 1)
    ON CONFLICT(key) DO UPDATE SET value = value + 1
  `;
  
  await runQuery(sql, [key]);
  return getCounter(key);
}

export async function setCounter(key: string, value: number): Promise<void> {
  const sql = `
    INSERT INTO counters (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?
  `;
  
  await runQuery(sql, [key, value, value]);
}

/** ===== 데이터베이스 닫기 ===== */
export function closeDatabase(): void {
  if (_db) {
    _db.close((err) => {
      if (err) {
        console.error('Database close error:', err);
      } else {
        console.log('Database connection closed');
      }
    });
    _db = null;
  }
}