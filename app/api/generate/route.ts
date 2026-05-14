import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { geminiClient, GEMINI_IMAGE_MODELS, imagenPrompt } from '@/lib/gemini';

export const runtime = 'nodejs';

type CacheEntry = { imageBase64: string; mimeType: string; model: string };
const CACHE_CAP = 16;
const imageCache = new Map<string, CacheEntry>();

function cacheKey(prompt: string, anchor?: { imageBase64: string; mimeType: string }): string {
  const h = createHash('sha1');
  h.update(prompt);
  if (anchor?.imageBase64) {
    h.update('|');
    h.update(anchor.mimeType || '');
    h.update('|');
    h.update(anchor.imageBase64.slice(0, 256));
  }
  return h.digest('hex');
}

function cacheGet(key: string): CacheEntry | null {
  const hit = imageCache.get(key);
  if (!hit) return null;
  imageCache.delete(key);
  imageCache.set(key, hit);
  return hit;
}

function cacheSet(key: string, entry: CacheEntry): void {
  if (imageCache.has(key)) imageCache.delete(key);
  imageCache.set(key, entry);
  while (imageCache.size > CACHE_CAP) {
    const oldest = imageCache.keys().next().value;
    if (oldest === undefined) break;
    imageCache.delete(oldest);
  }
}

type Body = {
  items: string[];
  mode: 'fashion' | 'home';
  style?: string;
  pieces?: { description: string }[];
  anchor?: { imageBase64: string; mimeType: string; type?: string };
  prompt?: string;
};

function buildPrompt(body: Body): string {
  // Use Gemini-authored imagePrompt only when an anchor image is present
  // (the prompt is written to reference "the exact reference item shown").
  if (body.prompt && body.anchor) return body.prompt;
  const pieceList =
    body.pieces?.map((p) => p.description).filter(Boolean).join(', ') ||
    body.items.join(', ');
  const anchorType = body.anchor?.type || 'item';
  if (body.mode === 'fashion') {
    if (body.anchor) {
      return `Editorial flat-lay fashion photo on a soft neutral off-white background. Compose this outfit: ${pieceList}, together with the exact reference ${anchorType} shown in the attached image — reproduce that ${anchorType} faithfully (same color, fabric, cut). Clean editorial magazine styling, soft natural light, no people, no text, no watermarks.`;
    }
    return `Editorial flat-lay fashion photo on a soft neutral off-white background. Outfit featuring: ${pieceList}. Clean editorial magazine styling, soft natural light, no people, no text, no watermarks.`;
  }
  if (body.anchor) {
    return `Cozy interior design render. Room featuring: ${pieceList}, arranged around the exact reference ${anchorType} shown in the attached image — reproduce that ${anchorType} faithfully. Clean minimalist styling, natural light, editorial aesthetic, no text, no watermarks.`;
  }
  return `Cozy interior design render. Room featuring: ${pieceList}. Clean minimalist styling, natural light, editorial aesthetic, no text, no watermarks.`;
}

function stripDataUrl(b64: string): string {
  const idx = b64.indexOf('base64,');
  return idx >= 0 ? b64.slice(idx + 7) : b64;
}

async function tryGenerate(
  client: ReturnType<typeof geminiClient>,
  modelName: string,
  prompt: string,
  anchor?: { imageBase64: string; mimeType: string },
) {
  if (!client) return null;
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as never,
  });
  const parts: unknown[] = [];
  if (anchor?.imageBase64) {
    parts.push({
      inlineData: {
        data: stripDataUrl(anchor.imageBase64),
        mimeType: anchor.mimeType || 'image/jpeg',
      },
    });
  }
  parts.push({ text: prompt });
  const result = await model.generateContent(parts as never);
  const respParts = result.response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = respParts.find((p) => 'inlineData' in p && p.inlineData?.data) as
    | { inlineData: { data: string; mimeType: string } }
    | undefined;
  if (!imagePart) {
    console.warn(`[api/generate] ${modelName}: no inlineData; parts =`, respParts.map((p) => Object.keys(p)).flat());
    return null;
  }
  return imagePart.inlineData;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { items = [], mode = 'fashion', pieces, anchor } = body;
  const prompt = buildPrompt(body) || imagenPrompt(mode, items);

  const key = cacheKey(prompt, anchor);
  const hit = cacheGet(key);
  if (hit) {
    console.log(`[api/generate] cache hit (${key.slice(0, 8)}) → returning ${hit.model}`);
    return NextResponse.json({
      imageBase64: hit.imageBase64,
      mimeType: hit.mimeType,
      cached: true,
      mock: false,
      model: hit.model,
      prompt,
    });
  }

  const client = geminiClient();
  if (!client) {
    console.warn('[api/generate] GEMINI_API_KEY not set → placeholder');
    return NextResponse.json({ imageBase64: '', cached: false, mock: true, prompt });
  }

  console.log('\n========== [api/generate] ==========');
  console.log('Mode:', mode, '| pieces:', pieces?.length ?? items.length, '| anchor:', anchor ? `yes (${anchor.mimeType})` : 'no');
  console.log('Prompt:', prompt.slice(0, 240));

  for (const modelName of GEMINI_IMAGE_MODELS) {
    try {
      console.log(`→ trying ${modelName}`);
      const data = await tryGenerate(client, modelName, prompt, anchor);
      if (data) {
        console.log(`✓ ${modelName} succeeded, base64 length: ${data.data.length}`);
        console.log('====================================\n');
        cacheSet(key, { imageBase64: data.data, mimeType: data.mimeType, model: modelName });
        return NextResponse.json({
          imageBase64: data.data,
          mimeType: data.mimeType,
          cached: false,
          mock: false,
          model: modelName,
          prompt,
        });
      }
    } catch (err) {
      console.error(`✗ ${modelName} error:`, (err as Error).message);
    }
  }

  console.warn('All image models failed → returning placeholder');
  console.log('====================================\n');
  return NextResponse.json({ imageBase64: '', cached: false, mock: true, prompt });
}
