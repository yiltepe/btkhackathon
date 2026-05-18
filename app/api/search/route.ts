import { NextRequest, NextResponse } from 'next/server';
import { serperSearch, hasSearch } from '@/lib/search';
import { mockProducts } from '@/lib/mocks';
import { isTrusted } from '@/lib/retailers';
import type { Budget, Gender, Lang, Mode, Product } from '@/lib/types';

export const runtime = 'nodejs';

type Body = { query: string; mode: Mode; language: Lang; gender?: Gender | null; budget?: Budget | null };

function genderQualifier(gender: Gender | null | undefined, _mode: Mode, lang: Lang, existingQuery: string): string {
  if (!gender || gender === 'unisex') return '';
  const q = existingQuery.toLowerCase();
  const alreadyHas = lang === 'tr'
    ? /(erkek|kadın|kadin|çocuk|cocuk|bebek|unisex)/.test(q)
    : /(\bmen'?s?\b|\bwomen'?s?\b|\bkid'?s?\b|\bchildren'?s?\b|\bunisex\b)/i.test(q);
  if (alreadyHas) return '';
  if (lang === 'tr') return gender === 'men' ? ' erkek' : ' kadın';
  return gender === 'men' ? ' men' : ' women';
}

const LOCALE_RETAILERS: Record<Lang, string[]> = {
  tr: ['trendyol.com', 'hepsiburada.com', 'n11.com', 'gittigidiyor.com', 'amazon.com.tr', 'teknosa.com', 'mediamarkt.com.tr', 'vatanbilgisayar.com', 'boyner.com.tr', 'koton.com', 'lcw.com', 'morhipo.com'],
  en: ['amazon.com', 'walmart.com', 'target.com', 'bestbuy.com', 'ebay.com', 'mrporter.com', 'ssense.com', 'farfetch.com'],
};

function localeBoost(p: Product, lang: Lang): number {
  const hay = `${p.link || ''} ${p.retailer || ''}`.toLowerCase();
  return LOCALE_RETAILERS[lang].some((d) => hay.includes(d)) ? 1 : 0;
}

function tierOf(p: Product, lang: Lang): number {
  // Higher tier = ranked higher. 2 = trusted brand, 1 = locale match, 0 = unknown.
  if (isTrusted(p.retailer, p.link)) return 2;
  if (localeBoost(p, lang)) return 1;
  return 0;
}

function applyLocaleSort(products: Product[], lang: Lang): Product[] {
  return [...products].sort((a, b) => {
    const ta = tierOf(a, lang);
    const tb = tierOf(b, lang);
    if (ta !== tb) return tb - ta;
    if (a.price === null && b.price === null) return 0;
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return a.price - b.price;
  });
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
  // When the user set a HARD MIN ("5000 ve üzeri"), never silently fall back to cheaper items —
  // it's better to return empty than to violate the constraint. Soft-fallback applies only when
  // the constraint is just a max (so we still show *something* even if it's slightly over).
  if (filtered.length === 0) {
    if (budget.min !== null) return [];
    return products;
  }
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
  const finalQuery = `${query}${genderQualifier(gender, mode, language, query)}`.trim();

  if (!hasSearch()) {
    console.warn('[api/search] SERPER_API_KEY not set → mock products');
    return NextResponse.json({ products: mockProducts(mode, language) });
  }

  try {
    let products = await serperSearch(finalQuery, language);
    products = applyBudgetFilter(products, budget);
    products = applyLocaleSort(products, language);
    return NextResponse.json({ products });
  } catch (err) {
    console.error('[api/search] Serper error → falling back to mock:', err);
    return NextResponse.json({ products: mockProducts(mode, language) });
  }
}
