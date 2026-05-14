import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_TEXT_MODEL, PROMPTS, RESPONSE_SCHEMA } from '@/lib/gemini';
import { mockResponse } from '@/lib/mocks';
import type { Budget, Gender, Lang, Mode, ResolvedProduct, Message } from '@/lib/types';
import { buildContextPreamble } from '@/lib/preamble';

export const runtime = 'nodejs';

type Body = {
  message: string;
  resolvedProduct?: ResolvedProduct;
  mode: Mode;
  chatHistory?: Message[];
  language: Lang;
  gender?: Gender | null;
  budget?: Budget | null;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { message, resolvedProduct, mode = 'auto', language = 'en', chatHistory = [], gender = null, budget = null } = body;

  const client = geminiClient();
  if (!client) {
    console.warn('[api/chat] GEMINI_API_KEY not set → mock response');
    return NextResponse.json(mockResponse(mode, language, message));
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_TEXT_MODEL,
      systemInstruction: PROMPTS[mode][language],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA as never,
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    });

    const HISTORY_TURNS = 16;
    const trimmed = chatHistory.slice(-HISTORY_TURNS);
    const firstUserIdx = trimmed.findIndex((m) => m.role === 'user');
    const aligned = firstUserIdx >= 0 ? trimmed.slice(firstUserIdx) : [];
    const history = aligned
      .filter((m) => typeof m.text === 'string' && m.text.trim().length > 0)
      .map((m) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text.slice(0, 4000) }],
      }));

    const userParts: string[] = [];
    const preamble = buildContextPreamble(gender, budget, language);
    if (preamble) userParts.push(preamble);
    const urlMatch = message.match(/https?:\/\/\S+/);
    if (resolvedProduct) {
      userParts.push(`The user pasted a product link. Here is the resolved product data:\nTitle: ${resolvedProduct.title}`);
      if (resolvedProduct.image) userParts.push(`Image URL: ${resolvedProduct.image}`);
      if (resolvedProduct.jsonLd) userParts.push(`Structured data (JSON-LD): ${JSON.stringify(resolvedProduct.jsonLd).slice(0, 2000)}`);
      userParts.push('Use this resolved data — do not invent product details. Identify the item from the title and JSON-LD only.');
    } else if (urlMatch) {
      userParts.push(`The user pasted a URL (${urlMatch[0]}) but we could not fetch the page. Do NOT invent a product. Ask the user briefly (in their language) to describe the product or share an image.`);
    }
    userParts.push(`User message: ${message}`);

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userParts.join('\n\n'));
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[api/chat] Gemini error → falling back to mock:', err);
    return NextResponse.json(mockResponse(mode, language, message));
  }
}
