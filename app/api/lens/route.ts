import { NextRequest, NextResponse } from 'next/server';
import { serperLens, hasSearch } from '@/lib/search';
import type { Lang } from '@/lib/types';

export const runtime = 'nodejs';

type Body = { imageUrl: string; language?: Lang };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { imageUrl, language = 'en' } = body;
  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    return NextResponse.json({ error: 'invalid_image_url' }, { status: 400 });
  }
  if (!hasSearch()) {
    return NextResponse.json({ products: [] });
  }

  console.log('\n========== [api/lens] ==========');
  console.log('Image URL:', imageUrl, '| lang:', language);

  try {
    const products = await serperLens(imageUrl, language);
    console.log(`Lens returned ${products.length} products (top retailer: ${products[0]?.retailer ?? '—'})`);
    console.log('=================================\n');
    return NextResponse.json({ products });
  } catch (err) {
    console.error('[api/lens] error:', err);
    return NextResponse.json({ products: [] });
  }
}
