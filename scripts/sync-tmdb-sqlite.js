/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/sync-tmdb-sqlite.js

const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// --- Config ---
const TMDB_ACCESS_TOKEN = process.env.TMDB_API_ACCESS_TOKEN;
const DB_PATH = path.join(__dirname, '..', 'data', 'local.db');

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const PAGES_TO_FETCH = 50; // Fetch 1000 items

// --- DB Init ---
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        return reject(err);
      }
      console.log('DB connected.');
      db.run('DROP TABLE IF EXISTS contents', (err) => {
        if (err) {
          return reject(err);
        }
        console.log('Old table dropped.');
        db.run(`
          CREATE TABLE contents (
            id TEXT PRIMARY KEY,
            kind TEXT NOT NULL CHECK (kind IN ('movie', 'drama', 'show', 'kpop', 'doc')),
            title TEXT NOT NULL,
            original_title TEXT,
            summary TEXT NOT NULL,
            thumbnail_url TEXT NOT NULL,
            backdrop_url TEXT,
            size_mb INTEGER NOT NULL CHECK (size_mb > 0),
            is_active BOOLEAN DEFAULT 1,
            tmdb_id INTEGER,
            tmdb_type TEXT CHECK (tmdb_type IN ('movie', 'tv')),
            release_date DATE,
            genre_ids TEXT,
            vote_average DECIMAL(3,1),
            vote_count INTEGER,
            popularity DECIMAL(10,3),
            adult BOOLEAN DEFAULT 0,
            original_language TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(db);
          }
        });
      });
    });
  });
}

// --- Fetch ---
async function fetchMultiplePages(type) {
  let allResults = [];
  console.log(`Fetching ${type} from TMDB (region: KR, ${PAGES_TO_FETCH} pages)...`);
  
  for (let page = 1; page <= PAGES_TO_FETCH; page++) {
    const url = `${TMDB_API_BASE_URL}/${type}/popular?language=ko-KR&page=${page}&region=KR`;
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
        console.error(` - Page ${page} failed: ${response.statusText}`);
        continue;
      }
      const data = await response.json();
      allResults.push(...data.results);
      console.log(` - Page ${page} loaded. Total: ${allResults.length}`);
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(` - Page ${page} error:`, error.message);
    }
  }
  console.log(`Fetched ${allResults.length} ${type} items.`);
  return allResults;
}

// --- Transform ---
function transformData(item, kind, tmdb_type) {
  if (!item.overview || !item.poster_path || item.adult) {
    return null;
  }

  // Classify TV shows based on genre
  let newKind = kind;
  if (tmdb_type === 'tv') {
    const showGenreIds = [10764, 10767, 10763]; // Reality, Talk, News
    const isShow = item.genre_ids.some(id => showGenreIds.includes(id));
    if (isShow) {
      newKind = 'show';
    }
  }

  const size_mb = newKind === 'movie'
    ? Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000
    : Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;

  return {
    id: `${tmdb_type}_${item.id}`,
    kind: newKind,
    title: item.title || item.name,
    original_title: item.original_title || item.original_name,
    summary: item.overview,
    thumbnail_url: `${TMDB_IMAGE_BASE_URL}${item.poster_path}`,
    backdrop_url: item.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${item.backdrop_path}` : null,
    size_mb: size_mb,
    is_active: 1,
    tmdb_id: item.id,
    tmdb_type: tmdb_type,
    release_date: item.release_date || item.first_air_date || null,
    genre_ids: JSON.stringify(item.genre_ids || []),
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    popularity: item.popularity || 0,
    adult: item.adult ? 1 : 0,
    original_language: item.original_language || 'en'
  };
}

// --- Insert ---
function insertContents(db, contents) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO contents (
        id, kind, title, original_title, summary, thumbnail_url, backdrop_url,
        size_mb, is_active, tmdb_id, tmdb_type, release_date, genre_ids,
        vote_average, vote_count, popularity, adult, original_language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    let insertedCount = 0;
    let errorCount = 0;
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      contents.forEach((content) => {
        stmt.run([
          content.id, content.kind, content.title, content.original_title,
          content.summary, content.thumbnail_url, content.backdrop_url,
          content.size_mb, content.is_active, content.tmdb_id, content.tmdb_type,
          content.release_date, content.genre_ids, content.vote_average,
          content.vote_count, content.popularity, content.adult, content.original_language
        ], (err) => {
          if (err) {
            errorCount++;
          } else {
            insertedCount++;
          }
        });
      });
      stmt.finalize();
      db.run('COMMIT', (err) => {
        if (err) {
          return reject(err);
        }
        if (errorCount > 0) {
          console.log(`- ${errorCount} errors during insert (e.g. duplicates).`);
        }
        resolve(insertedCount);
      });
    });
  });
}

// --- Main ---
async function main() {
  console.log('Starting TMDB to SQLite sync for Korean content...');

  if (!TMDB_ACCESS_TOKEN) {
    console.error('TMDB_API_ACCESS_TOKEN is not set in .env.local');
    return;
  }

  let db;
  try {
    db = await initializeDatabase();
    const movies = await fetchMultiplePages('movie');
    const dramas = await fetchMultiplePages('tv');
    console.log(`
Fetched ${movies.length} movies and ${dramas.length} dramas.`);
    
    console.log('\nTransforming data...');
    const transformedMovies = movies.map(movie => transformData(movie, 'movie', 'movie')).filter(Boolean);
    const transformedDramas = dramas.map(drama => transformData(drama, 'drama', 'tv')).filter(Boolean);
    const allContents = [...transformedMovies, ...transformedDramas];
    console.log(`Transformed ${allContents.length} valid items.`);

    const uniqueContents = allContents.filter((item, index, self) =>
      index === self.findIndex((t) => (t.id === item.id))
    );
    if (allContents.length !== uniqueContents.length) {
      console.log(`Removed ${allContents.length - uniqueContents.length} duplicates. Total unique items: ${uniqueContents.length}`);
    }

    if (uniqueContents.length === 0) {
      console.log('No new content to sync.');
      return;
    }

    console.log('\nInserting data into SQLite DB...');
    const insertedCount = await insertContents(db, uniqueContents);
    console.log(`Success! Synced ${insertedCount} items to SQLite DB.`);

  } catch (error) {
    console.error('\nError during sync:', error.message);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing DB:', err.message);
        } else {
          console.log('DB connection closed.');
        }
      });
    }
  }
}

main();
