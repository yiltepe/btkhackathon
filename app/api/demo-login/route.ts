import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const userId = process.env.DEMO_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: 'demo_disabled' }, { status: 503 });
  }

  try {
    const client = await clerkClient();
    const token = await client.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 60,
    });
    return NextResponse.json({ ticket: token.token });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ error: 'mint_failed', detail: msg }, { status: 500 });
  }
}
