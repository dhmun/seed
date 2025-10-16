import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file before importing anything that uses env vars
config({ path: resolve(process.cwd(), '.env.local') });

import { syncPopularPlaylists } from '../src/server/actions/spotify_sync';

async function main() {
  console.log('🚀 인기 플레이리스트 동기화 시작...');
  console.log('📝 최신 K-Pop 아티스트별 검색:');
  console.log('  - BTS, BLACKPINK, NewJeans, aespa');
  console.log('  - IVE, TWICE, Stray Kids, (G)I-DLE');
  console.log('  - ITZY, SEVENTEEN, Red Velvet, ENHYPEN');
  console.log('  - LE SSERAFIM, NMIXX, FIFTY FIFTY');
  console.log('  📅 기간: 2016-2025년 (최신 인기곡 위주)');
  console.log('');

  try {
    const result = await syncPopularPlaylists();
    console.log('');
    console.log('📊 동기화 결과:', result);

    if (result.success) {
      console.log('');
      console.log('✅ 인기 플레이리스트 동기화 완료!');
      console.log(`📀 총 ${result.data?.totalTracks}개의 트랙이 데이터베이스에 저장되었습니다.`);
    } else {
      console.error('');
      console.error('❌ 인기 플레이리스트 동기화 실패');
      console.error('오류:', result.message);
    }
  } catch (e) {
    console.error('');
    console.error('💥 예상치 못한 오류 발생:', e);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Unhandled error:', e);
  process.exit(1);
});