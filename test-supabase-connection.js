/*
  Usage:
    node test-supabase-connection.js

  Requires env vars (in your shell or .env.* loaded by Next):
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY  (or SUPABASE_SERVICE_ROLE_KEY)
*/

(async () => {
  try {
    // Load environment variables from .env.local
    require('dotenv').config({ path: '.env.local' });

    const { createClient } = await import('@supabase/supabase-js');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || (!anon && !svc)) {
      console.error('[FAIL] Missing env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
      process.exit(1);
    }

    const supabase = createClient(url, (anon ?? svc));

    const tables = [
      'contents',
      'packs',
      'pack_items',
      'messages',
      'counters',
      'spotify_tracks',
      'share_events',
      'pack_views',
    ];

    const results = [];
    for (const table of tables) {
      try {
        const { error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        results.push({ table, ok: !error, count: count ?? null, error: error?.message });
      } catch (e) {
        results.push({ table, ok: false, error: e && e.message ? e.message : String(e) });
      }
    }

    // Test RPC
    let rpcOk = false; let rpcValue = null; let rpcError;
    try {
      const { data, error } = await supabase.rpc('increment_counter', { counter_key: 'pack_serial' });
      if (error) rpcError = error.message; else { rpcOk = true; rpcValue = data; }
    } catch (e) { rpcError = e && e.message ? e.message : String(e); }

    const allOk = results.every(r => r.ok) && rpcOk;

    console.log('\nSupabase verification summary');
    console.log('URL:', url);
    console.log('Auth mode:', anon ? 'anon' : 'service_role');
    console.table(results.map(r => ({ table: r.table, ok: r.ok, count: r.count ?? '-', error: r.error || '-' })));
    console.log('RPC increment_counter:', rpcOk ? `OK (value=${rpcValue})` : `FAIL (${rpcError})`);

    if (!allOk) {
      console.error('\n[FAIL] One or more checks failed.');
      process.exit(2);
    }

    console.log('\n[OK] All checks passed.');
  } catch (e) {
    console.error('[FATAL]', e);
    process.exit(99);
  }
})();

