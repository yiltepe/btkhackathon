import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMPTY = {
  chats: [],
  cart: [],
  gender: null,
  budget: null,
  prefs_summary: '',
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from('user_state')
      .select('chats, cart, gender, budget, prefs_summary')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json(data ?? EMPTY);
  } catch (e) {
    return NextResponse.json({ ...EMPTY, _warning: 'supabase_unavailable' });
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const patch: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() };
  if ('chats' in body) patch.chats = body.chats ?? [];
  if ('cart' in body) patch.cart = body.cart ?? [];
  if ('gender' in body) patch.gender = body.gender ?? null;
  if ('budget' in body) patch.budget = body.budget ?? null;
  if ('prefsSummary' in body) patch.prefs_summary = body.prefsSummary ?? '';

  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from('user_state').upsert(patch, { onConflict: 'user_id' });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'supabase_unavailable' }, { status: 503 });
  }
}
