import type { Product } from './types';

export function hasSearch(): boolean {
  return !!process.env.SERPER_API_KEY;
}

type SerperShoppingItem = {
  title?: string;
  source?: string;
  link?: string;
  price?: string;
  imageUrl?: string;
  productId?: string;
};

type SerperOrganicItem = {
  title?: string;
  link?: string;
  snippet?: string;
  imageUrl?: string;
  source?: string;
  price?: string;
};

const CURRENCY_BY_SYMBOL: Record<string, string> = {
  '₺': 'TRY',
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '₽': 'RUB',
  '¥': 'JPY',
};

function detectCurrency(raw: string): string | null {
  for (const sym of Object.keys(CURRENCY_BY_SYMBOL)) {
    if (raw.includes(sym)) return CURRENCY_BY_SYMBOL[sym];
  }
  const code = raw.match(/\b(TRY|USD|EUR|GBP|TL)\b/i)?.[1]?.toUpperCase();
  if (code === 'TL') return 'TRY';
  return code ?? null;
}

function parsePrice(raw: string | undefined, currency: string | null): number | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d.,]/g, '');
  if (!digits) return null;

  const hasComma = digits.includes(',');
  const hasDot = digits.includes('.');
  let normalized = digits;

  if (hasComma && hasDot) {
    // Rightmost separator is the decimal mark.
    if (digits.lastIndexOf(',') > digits.lastIndexOf('.')) {
      normalized = digits.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = digits.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Lone comma: TRY/EUR conventionally use it as decimal; USD uses it as thousands.
    const isDecimalLocale = currency === 'TRY' || currency === 'EUR';
    const parts = digits.split(',');
    if (isDecimalLocale && parts[parts.length - 1].length <= 2) {
      normalized = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    } else {
      normalized = digits.replace(/,/g, '');
    }
  }

  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

function retailerFromSource(source: string | undefined, link: string | undefined): string {
  if (source && source.trim()) return source.trim();
  if (!link) return 'Retailer';
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    const base = host.split('.')[0];
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return 'Retailer';
  }
}

function shoppingToProduct(item: SerperShoppingItem): Product | null {
  if (!item.link) return null;
  const currency = item.price ? detectCurrency(item.price) : null;
  const price = parsePrice(item.price, currency);
  return {
    name: item.title ?? 'Product',
    price,
    currency: currency ?? 'USD',
    thumbnail: item.imageUrl ?? '',
    link: item.link,
    retailer: retailerFromSource(item.source, item.link),
  };
}

function organicToProduct(item: SerperOrganicItem): Product | null {
  if (!item.link) return null;
  const priceRaw = item.price ?? item.snippet?.match(/[₺$€£]\s?[\d.,]+/)?.[0];
  const currency = priceRaw ? detectCurrency(priceRaw) : null;
  return {
    name: item.title ?? 'Product',
    price: parsePrice(priceRaw, currency),
    currency: currency ?? 'USD',
    thumbnail: item.imageUrl ?? '',
    link: item.link,
    retailer: retailerFromSource(item.source, item.link),
  };
}

function dedupeAndSort(products: Product[]): Product[] {
  const byRetailer = new Map<string, Product>();
  for (const p of products) {
    const prev = byRetailer.get(p.retailer);
    if (!prev) {
      byRetailer.set(p.retailer, p);
      continue;
    }
    if (prev.price === null && p.price !== null) byRetailer.set(p.retailer, p);
    else if (prev.price !== null && p.price !== null && p.price < prev.price) byRetailer.set(p.retailer, p);
  }
  const out = Array.from(byRetailer.values());
  out.sort((a, b) => {
    if (a.price === null && b.price === null) return 0;
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return a.price - b.price;
  });
  return out;
}

async function serperPost<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return null;
  const res = await fetch(`https://google.serper.dev${path}`, {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[serper] ${path} ${res.status}: ${text.slice(0, 240)}`);
    return null;
  }
  return (await res.json()) as T;
}

export type WebSnippet = { title: string; link: string; snippet: string; source?: string };

export async function serperWebSnippets(query: string, lang: 'en' | 'tr', num = 6): Promise<WebSnippet[]> {
  const locale = lang === 'tr' ? { gl: 'tr', hl: 'tr' } : { gl: 'us', hl: 'en' };
  const res = await serperPost<{ organic?: SerperOrganicItem[]; answerBox?: { snippet?: string; title?: string; link?: string }; knowledgeGraph?: { description?: string; title?: string; website?: string } }>('/search', {
    q: query,
    num,
    ...locale,
  });
  if (!res) return [];
  const out: WebSnippet[] = [];
  if (res.answerBox?.snippet) {
    out.push({
      title: res.answerBox.title ?? 'Answer',
      link: res.answerBox.link ?? '',
      snippet: res.answerBox.snippet,
      source: 'answerBox',
    });
  }
  if (res.knowledgeGraph?.description) {
    out.push({
      title: res.knowledgeGraph.title ?? 'Overview',
      link: res.knowledgeGraph.website ?? '',
      snippet: res.knowledgeGraph.description,
      source: 'knowledgeGraph',
    });
  }
  for (const o of res.organic ?? []) {
    if (!o.snippet || !o.link) continue;
    out.push({
      title: o.title ?? '',
      link: o.link,
      snippet: o.snippet,
      source: retailerFromSource(o.source, o.link),
    });
  }
  return out.slice(0, num);
}

export async function serperSearch(query: string, lang: 'en' | 'tr'): Promise<Product[]> {
  const locale = lang === 'tr' ? { gl: 'tr', hl: 'tr' } : { gl: 'us', hl: 'en' };

  const shopping = await serperPost<{ shopping?: SerperShoppingItem[] }>('/shopping', {
    q: query,
    num: 10,
    ...locale,
  });
  let products = (shopping?.shopping ?? []).map(shoppingToProduct).filter((p): p is Product => p !== null);

  if (products.filter((p) => p.price !== null).length < 3) {
    const organic = await serperPost<{ organic?: SerperOrganicItem[] }>('/search', {
      q: query,
      num: 10,
      ...locale,
    });
    const fromOrganic = (organic?.organic ?? []).map(organicToProduct).filter((p): p is Product => p !== null);
    products = [...products, ...fromOrganic];
  }

  return dedupeAndSort(products);
}
