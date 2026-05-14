import { NextRequest, NextResponse } from 'next/server';
import { serperSearch, hasSearch } from '@/lib/search';
import { mockProducts } from '@/lib/mocks';
import type { Budget, Gender, Lang, Mode, Product } from '@/lib/types';

export const runtime = 'nodejs';

type Body = { query: string; mode: Mode; language: Lang; gender?: Gender | null; budget?: Budget | null };

function genderQualifier(gender: Gender | null | undefined, mode: Mode, lang: Lang): string {
  if (!gender || gender === 'unisex') return '';
  if (mode !== 'fashion' && mode !== 'auto' && mode !== 'beauty') return '';
  if (lang === 'tr') return gender === 'men' ? ' erkek' : ' kadın';
  return gender === 'men' ? ' men' : ' women';
}

function applyBudgetFilter(products: Product[], budget: Budget | null | undefined): Product[] {
  if (!budget || (budget.min === null && budget.max === null)) return products;
  const priced = products.filter((p) => p.price !== null);
  if (priced.length === 0) return products;
  const filtered = priced.filter((p) => {
    const v = p.price as number;
    if (budget.min !== null && v < budget.min) return false;
    if (budget.max !== null && v > budget.max) return false;
    return true;
  });
  if (filtered.length === 0) return products;
  const unpriced = products.filter((p) => p.price === null);
  return [...filtered, ...unpriced];
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { query, mode = 'price', language = 'en', gender = null, budget = null } = body;
  const finalQuery = `${query}${genderQualifier(gender, mode, language)}`.trim();

  if (!hasSearch()) {
    console.warn('[api/search] SERPER_API_KEY not set → mock products');
    return NextResponse.json({ products: mockProducts(mode, language) });
  }

  try {
    let products = await serperSearch(finalQuery, language);
    products = applyBudgetFilter(products, budget);
    const priced = products.filter((p) => p.price !== null);
    if (priced.length < 3) {
      console.warn(`[api/search] only ${priced.length} priced results for "${finalQuery}" → padding with mocks`);
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
