import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

type Body = { url: string };

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

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

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
    const html = await res.text();
    const $ = cheerio.load(html);
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const title = ogTitle || $('title').first().text() || 'Product';
    let jsonLd: Record<string, unknown> | undefined;
    $('script[type="application/ld+json"]').each((_, el) => {
      if (jsonLd) return;
      try {
        const parsed = JSON.parse($(el).contents().text());
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const product = arr.find((p) => {
          const t = (p as { '@type'?: string | string[] })['@type'];
          return t === 'Product' || (Array.isArray(t) && t.includes('Product'));
        });
        if (product) jsonLd = product;
      } catch {
        /* ignore */
      }
    });
    return NextResponse.json({ title: title.trim().slice(0, 240), image: ogImage, jsonLd });
  } catch {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
  }
}
