// src/lib/database.ts
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'local.db');

// 콘텐츠 인터페이스 (기존 스키마에 맞춤)
export interface Content {
  id: string;
  kind: 'movie' | 'drama' | 'show' | 'kpop' | 'doc';
  title: string;
  summary: string;
  thumbnail_url: string;
  size_mb: number;
  is_active: boolean;
  created_at: string;
  tmdb_id?: number;
  vote_average?: number;
  release_date?: string;
  genre_ids?: number[];
  popularity?: number;
}

// 데이터베이스 연결 함수
export function getDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

// 데이터베이스 연결 종료
export function closeDatabase(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// 모든 활성 콘텐츠 조회
export async function getAllContents(): Promise<Content[]> {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM contents WHERE is_active = 1 ORDER BY popularity DESC, created_at DESC',
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const contents = rows.map((row: any) => ({
            ...row,
            genre_ids: row.genre_ids ? JSON.parse(row.genre_ids) : [],
            is_active: Boolean(row.is_active),
          }));
          resolve(contents);
        }
        closeDatabase(db);
      }
    );
  });
}

// 종류별 콘텐츠 조회
export async function getContentsByKind(kind: string): Promise<Content[]> {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM contents WHERE kind = ? AND is_active = 1 ORDER BY popularity DESC, created_at DESC',
      [kind],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const contents = rows.map((row: any) => ({
            ...row,
            genre_ids: row.genre_ids ? JSON.parse(row.genre_ids) : [],
            is_active: Boolean(row.is_active),
          }));
          resolve(contents);
        }
        closeDatabase(db);
      }
    );
  });
}

// ID로 콘텐츠 조회
export async function getContentById(id: string): Promise<Content | null> {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM contents WHERE id = ? AND is_active = 1',
      [id],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          const content = {
            ...row,
            genre_ids: row.genre_ids ? JSON.parse(row.genre_ids) : [],
            is_active: Boolean(row.is_active)
          };
          resolve(content);
        }
        closeDatabase(db);
      }
    );
  });
}

// 페이지네이션된 콘텐츠 조회
export async function getContentsWithPagination(
  page: number = 1,
  limit: number = 20,
  kind?: string
): Promise<{ contents: Content[]; total: number; hasMore: boolean }> {
  const db = await getDatabase();
  const offset = (page - 1) * limit;
  
  return new Promise((resolve, reject) => {
    // 총 개수 조회
    const countQuery = kind 
      ? 'SELECT COUNT(*) as total FROM contents WHERE kind = ? AND is_active = 1'
      : 'SELECT COUNT(*) as total FROM contents WHERE is_active = 1';
    
    const countParams = kind ? [kind] : [];
    
    db.get(countQuery, countParams, (err, countResult: any) => {
      if (err) {
        reject(err);
        closeDatabase(db);
        return;
      }
      
      const total = countResult.total;
      
      // 데이터 조회
      const dataQuery = kind
        ? 'SELECT * FROM contents WHERE kind = ? AND is_active = 1 ORDER BY popularity DESC, created_at DESC LIMIT ? OFFSET ?'
        : 'SELECT * FROM contents WHERE is_active = 1 ORDER BY popularity DESC, created_at DESC LIMIT ? OFFSET ?';
      
      const dataParams = kind ? [kind, limit, offset] : [limit, offset];
      
      db.all(dataQuery, dataParams, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const contents = rows.map((row: any) => ({
            ...row,
            genre_ids: row.genre_ids ? JSON.parse(row.genre_ids) : [],
            is_active: Boolean(row.is_active),
          }));
          
          resolve({
            contents,
            total,
            hasMore: offset + contents.length < total
          });
        }
        closeDatabase(db);
      });
    });
  });
}

// 검색 기능
export async function searchContents(query: string): Promise<Content[]> {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM contents 
       WHERE (title LIKE ? OR summary LIKE ?) 
       AND is_active = 1 
       ORDER BY popularity DESC, created_at DESC`,
      [`%${query}%`, `%${query}%`],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const contents = rows.map((row: any) => ({
            ...row,
            genre_ids: row.genre_ids ? JSON.parse(row.genre_ids) : [],
            is_active: Boolean(row.is_active),
          }));
          resolve(contents);
        }
        closeDatabase(db);
      }
    );
  });
}