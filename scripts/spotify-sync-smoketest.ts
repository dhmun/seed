import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { syncSpotifyTracks } from '../src/server/actions/spotify_sync';

async function main() {
  console.log('Starting Spotify sync smoke test...');
  console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'CONFIGURED' : 'NOT CONFIGURED');
  console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'CONFIGURED' : 'NOT CONFIGURED');
  const query = 'dreams fleetwood mac'; // 샘플 쿼리
  const limit = 3;

  try {
    const result = await syncSpotifyTracks(query, limit);
    console.log('Sync result:', result);

    if (result.success) {
      console.log('Spotify sync smoke test PASSED.');
    } else {
      console.error('Spotify sync smoke test FAILED.');
    }
  } catch (e) {
    console.error('An unexpected error occurred during smoke test:', e);
    console.error('Spotify sync smoke test FAILED.');
  }
}

main().catch(e => {
  console.error('Unhandled error in main:', e);
  process.exit(1);
});
