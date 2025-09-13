'use server';

import { getDatabase, runQuery, getQuery, allQuery, insertSampleData, type Content } from '@/lib/sqlite-db';

/** ===== 콘텐츠 CRUD 액션 ===== */

export async function initializeDatabase() {
  try {
    // 데이터베이스 초기화
    getDatabase();
    
    // 샘플 데이터가 있는지 확인
    const existingContents = await allQuery<Content>('SELECT * FROM contents LIMIT 1');
    
    if (existingContents.length === 0) {
      console.log('샘플 데이터 삽입 중...');
      await insertSampleData();
    }
    
    return { success: true };
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    return { success: false, error: String(error) };
  }
}

export async function listContents(kind?: 'movie' | 'drama' | 'show' | 'kpop' | 'doc'): Promise<Content[]> {
  try {
    // 데이터베이스 초기화 확인
    await initializeDatabase();
    
    let query = `
      SELECT id, kind, title, summary, thumbnail_url, size_mb, is_active, created_at,
             tmdb_id, vote_average, release_date, genre_ids, popularity
      FROM contents 
      WHERE is_active = 1
    `;
    const params: any[] = [];
    
    if (kind) {
      query += ' AND kind = ?';
      params.push(kind);
    }
    
    query += ' ORDER BY popularity DESC, created_at DESC';
    
    const contents = await allQuery<any>(query, params);
    
    // JSON 파싱 처리
    return contents.map(content => ({
      ...content,
      is_active: !!content.is_active,
      genre_ids: content.genre_ids ? JSON.parse(content.genre_ids) : undefined
    }));
  } catch (error) {
    console.error('콘텐츠 목록 조회 실패:', error);
    return [];
  }
}

export async function getContent(id: string): Promise<Content | null> {
  try {
    const content = await getQuery<any>(
      `SELECT id, kind, title, summary, thumbnail_url, size_mb, is_active, created_at,
              tmdb_id, vote_average, release_date, genre_ids, popularity
       FROM contents WHERE id = ? AND is_active = 1`,
      [id]
    );
    
    if (!content) return null;
    
    return {
      ...content,
      is_active: !!content.is_active,
      genre_ids: content.genre_ids ? JSON.parse(content.genre_ids) : undefined
    };
  } catch (error) {
    console.error('콘텐츠 조회 실패:', error);
    return null;
  }
}

export async function searchContents(query: string, kind?: 'movie' | 'drama' | 'show' | 'kpop' | 'doc'): Promise<Content[]> {
  try {
    let sqlQuery = `
      SELECT id, kind, title, summary, thumbnail_url, size_mb, is_active, created_at,
             tmdb_id, vote_average, release_date, genre_ids, popularity
      FROM contents 
      WHERE is_active = 1 
      AND (title LIKE ? OR summary LIKE ?)
    `;
    const params = [`%${query}%`, `%${query}%`];
    
    if (kind) {
      sqlQuery += ' AND kind = ?';
      params.push(kind);
    }
    
    sqlQuery += ' ORDER BY popularity DESC, created_at DESC';
    
    const contents = await allQuery<any>(sqlQuery, params);
    
    return contents.map(content => ({
      ...content,
      is_active: !!content.is_active,
      genre_ids: content.genre_ids ? JSON.parse(content.genre_ids) : undefined
    }));
  } catch (error) {
    console.error('콘텐츠 검색 실패:', error);
    return [];
  }
}

export async function getPopularContents(limit: number = 20): Promise<Content[]> {
  try {
    const contents = await allQuery<any>(
      `SELECT id, kind, title, summary, thumbnail_url, size_mb, is_active, created_at,
              tmdb_id, vote_average, release_date, genre_ids, popularity
       FROM contents 
       WHERE is_active = 1 
       ORDER BY popularity DESC, vote_average DESC 
       LIMIT ?`,
      [limit]
    );
    
    return contents.map(content => ({
      ...content,
      is_active: !!content.is_active,
      genre_ids: content.genre_ids ? JSON.parse(content.genre_ids) : undefined
    }));
  } catch (error) {
    console.error('인기 콘텐츠 조회 실패:', error);
    return [];
  }
}

export async function addContent(content: Omit<Content, 'id' | 'created_at'>): Promise<string | null> {
  try {
    const id = Math.random().toString(36).substring(2, 15);
    const createdAt = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO contents 
       (id, kind, title, summary, thumbnail_url, size_mb, is_active, created_at,
        tmdb_id, vote_average, release_date, genre_ids, popularity) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, content.kind, content.title, content.summary,
        content.thumbnail_url, content.size_mb, content.is_active,
        createdAt, content.tmdb_id, content.vote_average,
        content.release_date, JSON.stringify(content.genre_ids), content.popularity
      ]
    );
    
    return id;
  } catch (error) {
    console.error('콘텐츠 추가 실패:', error);
    return null;
  }
}

export async function updateContent(id: string, updates: Partial<Content>): Promise<boolean> {
  try {
    const setClauses = [];
    const params = [];
    
    if (updates.kind !== undefined) {
      setClauses.push('kind = ?');
      params.push(updates.kind);
    }
    if (updates.title !== undefined) {
      setClauses.push('title = ?');
      params.push(updates.title);
    }
    if (updates.summary !== undefined) {
      setClauses.push('summary = ?');
      params.push(updates.summary);
    }
    if (updates.thumbnail_url !== undefined) {
      setClauses.push('thumbnail_url = ?');
      params.push(updates.thumbnail_url);
    }
    if (updates.size_mb !== undefined) {
      setClauses.push('size_mb = ?');
      params.push(updates.size_mb);
    }
    if (updates.is_active !== undefined) {
      setClauses.push('is_active = ?');
      params.push(updates.is_active);
    }
    if (updates.tmdb_id !== undefined) {
      setClauses.push('tmdb_id = ?');
      params.push(updates.tmdb_id);
    }
    if (updates.vote_average !== undefined) {
      setClauses.push('vote_average = ?');
      params.push(updates.vote_average);
    }
    if (updates.release_date !== undefined) {
      setClauses.push('release_date = ?');
      params.push(updates.release_date);
    }
    if (updates.genre_ids !== undefined) {
      setClauses.push('genre_ids = ?');
      params.push(JSON.stringify(updates.genre_ids));
    }
    if (updates.popularity !== undefined) {
      setClauses.push('popularity = ?');
      params.push(updates.popularity);
    }
    
    if (setClauses.length === 0) return false;
    
    params.push(id);
    
    const result = await runQuery(
      `UPDATE contents SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
    
    return result.changes > 0;
  } catch (error) {
    console.error('콘텐츠 업데이트 실패:', error);
    return false;
  }
}

export async function deleteContent(id: string): Promise<boolean> {
  try {
    const result = await runQuery('DELETE FROM contents WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('콘텐츠 삭제 실패:', error);
    return false;
  }
}

export async function getContentStats() {
  try {
    const stats = await allQuery<{ kind: string; count: number; total_size_mb: number }>(
      `SELECT kind, COUNT(*) as count, SUM(size_mb) as total_size_mb 
       FROM contents 
       WHERE is_active = 1 
       GROUP BY kind`
    );
    
    const total = await getQuery<{ count: number; total_size_mb: number }>(
      `SELECT COUNT(*) as count, SUM(size_mb) as total_size_mb 
       FROM contents 
       WHERE is_active = 1`
    );
    
    return {
      by_kind: stats,
      total: total || { count: 0, total_size_mb: 0 }
    };
  } catch (error) {
    console.error('콘텐츠 통계 조회 실패:', error);
    return {
      by_kind: [],
      total: { count: 0, total_size_mb: 0 }
    };
  }
}