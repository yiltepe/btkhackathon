import { NextRequest, NextResponse } from 'next/server';
import { serperSearch, hasSearch } from '@/lib/search';
import { mockProducts } from '@/lib/mocks';
import type { Lang, Mode } from '@/lib/types';

export const runtime = 'nodejs';

type Body = { query: string; mode: Mode; language: Lang };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { query, mode = 'price', language = 'en' } = body;

  if (!hasSearch()) {
    console.warn('[api/search] SERPER_API_KEY not set → mock products');
    return NextResponse.json({ products: mockProducts(mode, language) });
  }

  try {
    let products = await serperSearch(query, language);
    const priced = products.filter((p) => p.price !== null);
    if (priced.length < 3) {
      const padding = mockProducts(mode, language).filter(
        (m) => !products.some((p) => p.retailer === m.retailer),
      );
      products = [...products, ...padding].slice(0, 8);
      products.sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      });
    }
    return NextResponse.json({ products });
  } catch (err) {
    console.error('[api/search] Serper error → falling back to mock:', err);
    return NextResponse.json({ products: mockProducts(mode, language) });
  }
}
