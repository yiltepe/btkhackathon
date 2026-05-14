import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

type Body = { url: string };

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': UA,
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Upgrade-Insecure-Requests': '1',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not.A/Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
};

function slugTitle(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const brand = host.split('.')[0];
    const segments = u.pathname.split('/').filter(Boolean);
    const cleaned = segments
      .map((s) => s.replace(/\.(html?|php|aspx?)$/i, ''))
      // drop SKU-ish trailing segments: "p-HBV0...", "415445-101", pure digit/hex IDs
      .filter((s) => {
        const t = s.toLowerCase();
        if (/^p-[a-z0-9]+$/i.test(t)) return false;
        if (/^[0-9]{4,}([-_][0-9]+)*$/.test(t)) return false;
        if (/^[a-f0-9]{12,}$/i.test(t)) return false;
        return true;
      });
    const last = cleaned[cleaned.length - 1];
    if (!last) return null;
    const pretty = decodeURIComponent(last)
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
    if (!pretty) return null;
    const brandPretty = brand.charAt(0).toUpperCase() + brand.slice(1);
    return `${brandPretty}: ${pretty}`;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, ms: number, headers: Record<string, string>) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { headers, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

async function tryDirect(url: string) {
  const res = await fetchWithTimeout(url, 9000, BROWSER_HEADERS);
  if (!res.ok) return null;
  const html = await res.text();
  const $ = cheerio.load(html);
  const ogTitle =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content');
  const ogImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content');
  const docTitle = $('title').first().text();
  const h1 = $('h1').first().text();
  const title = (ogTitle || docTitle || h1 || '').trim().slice(0, 240);

  let jsonLd: Record<string, unknown> | undefined;
  const isProduct = (p: unknown): p is Record<string, unknown> => {
    if (!p || typeof p !== 'object') return false;
    const t = (p as { '@type'?: string | string[] })['@type'];
    return t === 'Product' || (Array.isArray(t) && t.includes('Product'));
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    if (jsonLd) return;
    try {
      const parsed = JSON.parse($(el).contents().text());
      const candidates: unknown[] = [];
      const queue: unknown[] = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (queue.length) {
        const node = queue.shift();
        if (!node || typeof node !== 'object') continue;
        candidates.push(node);
        const graph = (node as { '@graph'?: unknown })['@graph'];
        if (Array.isArray(graph)) queue.push(...graph);
      }
      const product = candidates.find(isProduct);
      if (product) jsonLd = product;
    } catch {
      /* ignore */
    }
  });
  if (!title && !jsonLd) return null;
  // Reject bot-detection / error pages that return 200 with a useless title
  const lc = title.toLowerCase();
  const botSignals = ['just a moment', 'one more step', 'please wait', 'checking your browser',
    'access denied', 'robot check', 'attention required', 'enable javascript',
    'verification required', 'too many requests', 'service unavailable', 'cloudflare'];
  if (!jsonLd && botSignals.some((s) => lc.includes(s))) return null;
  return { title: title || 'Product', image: ogImage, jsonLd };
}

async function tryJinaReader(url: string) {
  // r.jina.ai is a free public reader that bypasses most bot protection
  // and returns clean text/markdown of the page.
  const proxied = `https://r.jina.ai/${url}`;
  const res = await fetchWithTimeout(
    proxied,
    10000,
    { 'User-Agent': UA, Accept: 'text/plain' },
  );
  if (!res.ok) return null;
  const text = await res.text();
  if (!text || text.length < 40) return null;

  // r.jina.ai output starts with a "Title: <title>" line, then the body.
  let title = '';
  let image: string | undefined;
  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  if (titleMatch) title = titleMatch[1].trim();
  const imgMatch = text.match(/^Image URL:\s*(\S+)/m) || text.match(/!\[[^\]]*\]\((https?:\/\/\S+)\)/);
  if (imgMatch) image = imgMatch[1];

  if (!title) {
    const firstHeading = text.match(/^#\s+(.+)$/m);
    if (firstHeading) title = firstHeading[1].trim();
  }
  if (!title) return null;

  // pull a short content excerpt to help Gemini (after the metadata block)
  const bodyStart = text.indexOf('\n\n');
  const excerpt = bodyStart > 0 ? text.slice(bodyStart, bodyStart + 1500).trim() : '';
  return {
    title: title.slice(0, 240),
    image,
    jsonLd: excerpt ? ({ description: excerpt } as Record<string, unknown>) : undefined,
  };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { url } = body;
  if (!url || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  console.log('\n========== [api/resolve] ==========');
  console.log('URL:', url);

  try {
    const direct = await tryDirect(url);
    if (direct) {
      console.log('Strategy: direct fetch');
      console.log('Title:', direct.title);
      console.log('Image:', direct.image || '(none)');
      console.log('JSON-LD Product:', direct.jsonLd ? 'yes' : 'no');
      console.log('====================================\n');
      return NextResponse.json(direct);
    }
    console.log('Direct fetch blocked/empty → trying r.jina.ai');
  } catch (err) {
    console.log('Direct fetch error:', (err as Error).message);
  }

  try {
    const jina = await tryJinaReader(url);
    if (jina) {
      console.log('Strategy: r.jina.ai reader');
      console.log('Title:', jina.title);
      console.log('Image:', jina.image || '(none)');
      console.log('Excerpt:', jina.jsonLd ? 'yes' : 'no');
      console.log('====================================\n');
      return NextResponse.json(jina);
    }
    console.log('r.jina.ai empty → using slug fallback');
  } catch (err) {
    console.log('r.jina.ai error:', (err as Error).message);
  }

  const slug = slugTitle(url);
  if (slug) {
    console.log('Strategy: slug fallback →', slug);
    console.log('====================================\n');
    return NextResponse.json({ title: slug, fallback: true });
  }

  console.log('All strategies failed');
  console.log('====================================\n');
  return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
}
