import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_TEXT_MODEL, PROMPTS, RESPONSE_SCHEMA } from '@/lib/gemini';
import type { Budget, Gender, Lang, Message, Mode } from '@/lib/types';
import { buildContextPreamble } from '@/lib/preamble';

export const runtime = 'nodejs';

type ImageInput = { base64: string; mimeType: string };

type Body = {
  imageBase64?: string;
  mimeType?: string;
  images?: ImageInput[];
  mode: Mode;
  language: Lang;
  message?: string;
  gender?: Gender | null;
  budget?: Budget | null;
  chatHistory?: Message[];
};

type ApiErrorBody = {
  error: 'missing_api_key' | 'rate_limited' | 'provider_denied' | 'provider_unavailable' | 'invalid_response';
  provider: 'gemini';
  status: number;
  retryable: boolean;
};

function providerError(status: number, error: ApiErrorBody['error'], retryable: boolean) {
  return NextResponse.json<ApiErrorBody>(
    { error, provider: 'gemini', status, retryable },
    { status },
  );
}

function mapGeminiError(err: unknown) {
  const status =
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof (err as { status?: unknown }).status === 'number'
      ? (err as { status: number }).status
      : 503;

  if (status === 429) return providerError(429, 'rate_limited', true);
  if (status === 403) return providerError(403, 'provider_denied', false);
  return providerError(status >= 400 ? status : 503, 'provider_unavailable', true);
}

const SIMILAR_CUE = /\b(similar|like this|find similar|benzeri|buna benzer|benzer bul)\b/i;
const EXACT_CUE = /\b(exact|this exact|find this exact|same one|the same|aynısı|aynısını|tam olarak bunu|bunu bul|bunun aynısı)\b/i;

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { imageBase64, mimeType, images, mode = 'auto', language = 'en', message, gender = null, budget = null, chatHistory = [] } = body;

  const imageList: ImageInput[] = images && images.length
    ? images
    : imageBase64
    ? [{ base64: imageBase64, mimeType: mimeType || 'image/jpeg' }]
    : [];

  if (imageList.length === 0) {
    return NextResponse.json({ error: 'no_image' }, { status: 400 });
  }

  const client = geminiClient();
  if (!client) {
    return providerError(503, 'missing_api_key', false);
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_TEXT_MODEL,
      systemInstruction: PROMPTS[mode][language],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA as never,
        temperature: 0.4,
      },
    });

    const preamble = buildContextPreamble(gender, budget, language);
    const isSimilar = !!message && SIMILAR_CUE.test(message);
    const isExact = !!message && !isSimilar && EXACT_CUE.test(message);
    const isEmptyMessage = !message || !message.trim();
    const multi = imageList.length > 1;
    const extras: string[] = [];
    if (multi) {
      extras.push(
        `MULTIPLE IMAGES ATTACHED (${imageList.length}). YOU MUST USE INTENT F (MULTI_ITEM). The user is talking about these ${imageList.length} items, not asking for an outfit — do NOT pick INTENT C (BUILD_OUTFIT) under any circumstance. Refer to images by ordinal position (1st, 2nd, …). Set \`sourceIndex\` (0-based) on every \`suggestions[]\` and \`comparison.items[]\` entry. For each image, identify any visible brand logo/wordmark/distinctive feature and put it in the item's \`name\` (e.g. "Adidas Samba", "Nike Air Force 1") — do NOT leave brand blank when it is visually identifiable.`,
      );
    }
    const priorAi = [...chatHistory].reverse().find((m) => m.role === 'ai');
    const priorComparison = priorAi?.response?.comparison;
    const priorIdentified = priorAi?.response?.identifiedItem;
    if (priorComparison?.items?.length) {
      const lines = ['PRIOR PRODUCT CONTEXT (from the previous AI turn — use this when the user references items by ordinal):'];
      priorComparison.items.forEach((it, i) => {
        const idx = typeof it.sourceIndex === 'number' ? it.sourceIndex : i;
        lines.push(`  [${idx + 1}] ${it.name}${it.bestFor ? ` — best for: ${it.bestFor}` : ''}${it.summary ? ` — ${it.summary}` : ''}`);
      });
      if (priorComparison.verdict) lines.push(`  Prior verdict: ${priorComparison.verdict}`);
      const block = lines.join('\n');
      extras.push(block.length > 1500 ? block.slice(0, 1500) + '…' : block);
    } else if (priorIdentified?.name) {
      extras.push(`PRIOR PRODUCT CONTEXT: previous turn identified "${priorIdentified.name}"${priorIdentified.type ? ` (${priorIdentified.type})` : ''}.`);
    }
    if (isSimilar) {
      extras.push(
        `VISUAL-SIMILARITY MODE: the user wants items that LOOK LIKE the attached image(s). Populate \`suggestions[].searchQuery\` with a tight visual descriptor (color + material + product type, ≤6 words) — do NOT use brand or model names.`,
      );
    } else if (isExact) {
      extras.push(
        `EXACT-MATCH MODE: the user wants the SAME item shown in the image. Inspect the photo for any visible brand logo, wordmark, model name, distinctive print, or signature design feature, and identify color, material, and product type. Put the brand in \`identifiedItem.name\` and \`identifiedItem\` fields. Each \`suggestions[].searchQuery\` MUST be retailer-friendly and combine \`brand + product type + color\` (≤5 words). If no brand is visually identifiable, fall back to \`color + material + product type\` and say so in \`text\`. \`mode\`="price". Output 1–3 suggestions for that one item. Do NOT build an outfit.`,
      );
    } else if (isEmptyMessage && !multi) {
      extras.push(
        `OUTFIT DECOMPOSITION MODE: a single image was attached with no text. If the photo shows a person wearing multiple clothing items, treat it as an outfit-decomposition request: identify EVERY visible clothing/accessory piece (top, bottom, outerwear, shoes, bag, hat, jewelry, etc.) and emit ONE \`suggestions[]\` entry per piece — find the EXACT item for each. For each piece, inspect for visible brand logos/wordmarks/distinctive features and bake \`brand + product type + color\` into the \`searchQuery\` (≤5 words). If no brand is visible for a piece, use \`color + material + product type\`. Set \`mode\`="price", \`hasVisual\`=false, omit \`imagePrompt\`. \`identifiedItem\` describes the overall look. Each suggestion gets a short \`reason\` naming which piece it is ("the top", "the shoes"). If the photo shows only ONE clothing item (a single product shot, not a person), treat it as a single FIND_ITEM instead.`,
      );
    }
    const parts = [preamble, ...extras, message ?? ''].filter(Boolean);
    const promptText = parts.join('\n\n');

    console.log('\n========== [api/analyze] GEMINI REQUEST ==========');
    console.log('Model:', GEMINI_TEXT_MODEL, '| mode:', mode, '| lang:', language);
    console.log('--- System Instruction ---');
    console.log(PROMPTS[mode][language]);
    console.log('--- Images ---');
    imageList.forEach((img, i) => console.log(`[${i}] mimeType: ${img.mimeType} | base64 length: ${img.base64.length}`));
    console.log('--- Prompt Text ---');
    console.log(promptText);
    console.log('==================================================\n');

    const contentParts = [
      ...imageList.map((img) => ({ inlineData: { data: img.base64, mimeType: img.mimeType } })),
      { text: promptText },
    ];
    const result = await model.generateContent(contentParts);
    const text = result.response.text();
    const usage = result.response.usageMetadata;
    console.log('========== [api/analyze] GEMINI RESPONSE ==========');
    if (usage) {
      console.log(`Tokens → prompt: ${usage.promptTokenCount} | output: ${usage.candidatesTokenCount} | total: ${usage.totalTokenCount}`);
    } else {
      console.log('Tokens → (no usageMetadata returned)');
    }
    console.log('--- Response Text ---');
    console.log(text);
    console.log('===================================================\n');
    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch (parseErr) {
      console.error('[api/analyze] JSON parse failed; raw text was:\n', text);
      console.error('[api/analyze] parse error:', parseErr);
      return providerError(502, 'invalid_response', true);
    }
  } catch (err) {
    console.error('[api/analyze] Gemini error → falling back to mock:', err);
    return mapGeminiError(err);
  }
}
