import type { Product } from './types';

export function hasSearch(): boolean {
  return !!(process.env.GOOGLE_CUSTOM_SEARCH_API_KEY && process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID);
}

type CseItem = {
  title?: string;
  link?: string;
  pagemap?: {
    offer?: Array<{ price?: string; pricecurrency?: string }>;
    product?: Array<{ price?: string; pricecurrency?: string }>;
    metatags?: Array<Record<string, string>>;
    cse_image?: Array<{ src?: string }>;
    cse_thumbnail?: Array<{ src?: string }>;
  };
};

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d,.\-]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function retailerFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const base = host.split('.')[0];
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return 'Retailer';
  }
}

function extractProduct(item: CseItem): Product | null {
  if (!item.link) return null;
  const offer = item.pagemap?.offer?.[0];
  const product = item.pagemap?.product?.[0];
  const meta = item.pagemap?.metatags?.[0];
  const rawPrice = offer?.price ?? product?.price ?? meta?.['product:price:amount'] ?? meta?.['og:price:amount'];
  const currency = offer?.pricecurrency ?? product?.pricecurrency ?? meta?.['product:price:currency'] ?? meta?.['og:price:currency'] ?? 'EUR';
  const thumb = item.pagemap?.cse_image?.[0]?.src ?? item.pagemap?.cse_thumbnail?.[0]?.src ?? '';
  return {
    name: item.title ?? 'Product',
    price: parsePrice(rawPrice),
    currency,
    thumbnail: thumb,
    link: item.link,
    retailer: retailerFromUrl(item.link),
  };
}

export async function cseSearch(query: string, lang: 'en' | 'tr'): Promise<Product[]> {
  const key = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
  if (!key || !cx) return [];

  const url = new URL('https://customsearch.googleapis.com/customsearch/v1');
  url.searchParams.set('key', key);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', query);
  url.searchParams.set('num', '10');
  url.searchParams.set('hl', lang);
  if (lang === 'tr') url.searchParams.set('gl', 'tr');

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: CseItem[] };
  const items = data.items ?? [];

  const parsed = items.map(extractProduct).filter((p): p is Product => p !== null);

  // dedupe by retailer (keep cheapest priced)
  const byRetailer = new Map<string, Product>();
  for (const p of parsed) {
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
