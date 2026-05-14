import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_TEXT_MODEL, PROMPTS, RESPONSE_SCHEMA } from '@/lib/gemini';
import { mockResponse } from '@/lib/mocks';
import type { Budget, Gender, Lang, Mode } from '@/lib/types';
import { buildContextPreamble } from '@/lib/preamble';

export const runtime = 'nodejs';

type Body = {
  imageBase64: string;
  mimeType: string;
  mode: Mode;
  language: Lang;
  message?: string;
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
  const { imageBase64, mimeType, mode = 'auto', language = 'en', message, gender = null, budget = null } = body;

  const client = geminiClient();
  if (!client) {
    return NextResponse.json(mockResponse(mode, language, '[image]'));
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

    const basePrompt = language === 'tr'
      ? 'Bu görseli analiz et ve önerilerini JSON olarak döndür.'
      : 'Analyze this image and return suggestions as JSON.';
    const preamble = buildContextPreamble(gender, budget, language);
    const parts = [preamble, basePrompt, message ? `User request: ${message}` : ''].filter(Boolean);
    const promptText = parts.join('\n\n');

    const result = await model.generateContent([
      {
        inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' },
      },
      { text: promptText },
    ]);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(mockResponse(mode, language, '[image]'));
  }
}
