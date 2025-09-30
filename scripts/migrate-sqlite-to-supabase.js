// SQLite 데이터를 Supabase로 일괄 이전하는 스크립트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3');
const path = require('path');

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

const DB_PATH = path.join(process.cwd(), 'data', 'local.db');

// SQLite 데이터베이스 연결
function getDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

// SQLite에서 모든 콘텐츠 조회
function getAllContentsFromSQLite(db) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM contents WHERE is_active = 1 ORDER BY created_at ASC',
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const contents = rows.map(row => ({
            id: row.id,
            kind: row.kind,
            title: row.title,
            summary: row.summary,
            thumbnail_url: row.thumbnail_url,
            size_mb: row.size_mb,
            is_active: Boolean(row.is_active),
            created_at: row.created_at,
            tmdb_id: row.tmdb_id || null,
            vote_average: row.vote_average || null,
            release_date: row.release_date || null,
            genre_ids: row.genre_ids ? JSON.parse(row.genre_ids) : null,
            popularity: row.popularity || null,
            original_title: row.original_title || null,
            backdrop_url: row.backdrop_url || null,
            tmdb_type: row.tmdb_type || null,
            vote_count: row.vote_count || null,
            adult: row.adult ? Boolean(row.adult) : null,
            original_language: row.original_language || null,
            updated_at: new Date().toISOString()
          }));
          resolve(contents);
        }
      }
    );
  });
}

async function migrateData() {
  console.log('🚀 SQLite -> Supabase 데이터 이전 시작...');

  try {
    // 1. SQLite 데이터 읽기
    console.log('\n1. SQLite 데이터 읽기...');
    const db = await getDatabase();
    const sqliteContents = await getAllContentsFromSQLite(db);
    console.log(`📊 SQLite에서 ${sqliteContents.length}개 콘텐츠 발견`);

    // 데이터베이스 연결 종료
    db.close();

    // 2. 기존 Supabase 데이터 확인
    console.log('\n2. 기존 Supabase 데이터 확인...');
    const { data: existingData, error: fetchError } = await supabase
      .from('contents')
      .select('id');

    if (fetchError) {
      console.error('❌ Supabase 데이터 조회 실패:', fetchError.message);
      return;
    }

    const existingIds = new Set(existingData?.map(item => item.id) || []);
    console.log(`📋 Supabase에 기존 데이터: ${existingIds.size}개`);

    // 3. 중복 제거
    const newContents = sqliteContents.filter(content => !existingIds.has(content.id));
    console.log(`🆕 새로 추가할 데이터: ${newContents.length}개`);

    if (newContents.length === 0) {
      console.log('✅ 모든 데이터가 이미 Supabase에 존재합니다.');
      return;
    }

    // 4. 배치 업로드 (Supabase는 한 번에 최대 1000개 지원)
    const batchSize = 100;
    let uploaded = 0;
    let failed = 0;

    console.log(`\n3. 데이터 이전 시작 (${Math.ceil(newContents.length / batchSize)}개 배치)...`);

    for (let i = 0; i < newContents.length; i += batchSize) {
      const batch = newContents.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(newContents.length / batchSize);

      console.log(`\n📤 배치 ${batchNumber}/${totalBatches} 업로드 중... (${batch.length}개)`);

      try {
        const { data, error } = await supabase
          .from('contents')
          .insert(batch)
          .select('id');

        if (error) {
          console.error(`❌ 배치 ${batchNumber} 업로드 실패:`, error.message);
          failed += batch.length;

          // 개별 업로드 시도
          console.log(`🔄 배치 ${batchNumber} 개별 업로드 시도...`);
          for (const content of batch) {
            try {
              const { error: singleError } = await supabase
                .from('contents')
                .insert([content]);

              if (singleError) {
                console.error(`❌ ${content.id} (${content.title}) 실패:`, singleError.message);
              } else {
                uploaded++;
                console.log(`✅ ${content.id} (${content.title}) 성공`);
              }
            } catch (singleErr) {
              console.error(`❌ ${content.id} 개별 업로드 오류:`, singleErr.message);
            }
          }
        } else {
          uploaded += data?.length || 0;
          console.log(`✅ 배치 ${batchNumber} 완료: ${data?.length || 0}개 업로드`);

          // 진행률 표시
          const progress = ((i + batch.length) / newContents.length * 100).toFixed(1);
          console.log(`📈 전체 진행률: ${progress}% (${uploaded}/${newContents.length})`);
        }
      } catch (batchError) {
        console.error(`❌ 배치 ${batchNumber} 처리 중 오류:`, batchError.message);
        failed += batch.length;
      }

      // 요청 간 딜레이 (rate limiting 방지)
      if (i + batchSize < newContents.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 5. 결과 확인
    console.log('\n📊 이전 완료!');
    console.log(`✅ 성공적으로 업로드된 항목: ${uploaded}개`);
    console.log(`❌ 실패한 항목: ${failed}개`);
    console.log(`📈 성공률: ${(uploaded / (uploaded + failed) * 100).toFixed(1)}%`);

    // 6. 최종 데이터 확인
    const { count: finalCount, error: finalError } = await supabase
      .from('contents')
      .select('*', { count: 'exact', head: true });

    if (finalError) {
      console.error('❌ 최종 확인 실패:', finalError.message);
    } else {
      console.log(`\n🎉 Supabase 총 콘텐츠 수: ${finalCount}개`);
    }

    // 7. 샘플 데이터 확인
    const { data: sampleData, error: sampleError } = await supabase
      .from('contents')
      .select('id, title, kind')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!sampleError && sampleData) {
      console.log('\n📝 최근 추가된 콘텐츠 (5개):');
      console.table(sampleData?.map(item => ({
        ID: item.id,
        제목: item.title,
        종류: item.kind
      })) || []);
    }

  } catch (error) {
    console.error('❌ 이전 중 오류 발생:', error.message);
  }
}

// 실행
migrateData();