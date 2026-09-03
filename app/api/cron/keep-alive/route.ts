import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Προαιρετικό: προστασία με secret ώστε να μην το καλεί οποιοσδήποτε
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // service role, όχι anon key
  );

  // Πραγματικό query σε υπαρκτό πίνακα — αυτό μετράει ως activity
  const { data, error } = await supabase
    .from('memory_boxes')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Keep-alive query failed:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), rows: data?.length ?? 0 });
}
