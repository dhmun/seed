// Supabase 연결 테스트 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...\n');

  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 환경 변수 상태:');
  console.log(`- SUPABASE_URL: ${supabaseUrl ? '✅ 설정됨' : '❌ 누락'}`);
  console.log(`- SERVICE_KEY: ${serviceKey ? '✅ 설정됨' : '❌ 누락'}`);
  console.log();

  if (!supabaseUrl || !serviceKey) {
    console.log('❌ 필수 환경 변수가 누락되었습니다.');
    return;
  }

  // Supabase 클라이언트 생성
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    console.log('🔌 Supabase 연결 시도...');
    
    // 간단한 연결 테스트 (현재 시간 조회)
    const { data, error } = await supabase
      .from('contents')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('⚠️  테이블이 존재하지 않습니다. 스키마를 먼저 생성해야 합니다.');
      console.log('📋 다음 SQL을 Supabase 대시보드에서 실행하세요:');
      console.log('   supabase-schema.sql 파일의 내용을 복사해서 실행');
      return;
    } else if (error) {
      console.log('❌ Supabase 연결 실패:', error.message);
      return;
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log(`📊 연결된 데이터베이스: ${supabaseUrl}`);
    
    // 테이블 존재 확인
    console.log('\n📋 테이블 존재 확인:');
    const tables = ['contents', 'packs', 'pack_items', 'counters'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(0);
        
        if (tableError) {
          console.log(`❌ ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ ${table}: 테이블 존재`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

  } catch (err) {
    console.log('❌ 연결 중 오류 발생:', err.message);
  }
}

testSupabaseConnection();