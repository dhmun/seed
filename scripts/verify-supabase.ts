import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

type CheckResult = {
  table: string;
  ok: boolean;
  count?: number | null;
  error?: string;
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!anon && !svc)) {
    console.error('Missing env. Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }

  const supabase = createClient(url, (anon ?? svc) as string);

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

  const checks: CheckResult[] = [];

  for (const table of tables) {
    try {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        checks.push({ table, ok: false, error: error.message });
      } else {
        checks.push({ table, ok: true, count: count ?? null });
      }
    } catch (e: any) {
      checks.push({ table, ok: false, error: e?.message || String(e) });
    }
  }

  // Test RPC: increment_counter('pack_serial')
  let rpcOk = false;
  let rpcValue: number | null = null;
  let rpcError: string | undefined;
  try {
    const { data, error } = await supabase.rpc('increment_counter', { counter_key: 'pack_serial' });
    if (error) {
      rpcError = error.message;
    } else {
      rpcOk = true;
      rpcValue = data as number | null;
    }
  } catch (e: any) {
    rpcError = e?.message || String(e);
  }

  const summary = {
    url,
    auth: anon ? 'anon' : 'service_role',
    tables: checks,
    rpc_increment_counter: { ok: rpcOk, value: rpcValue, error: rpcError },
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

