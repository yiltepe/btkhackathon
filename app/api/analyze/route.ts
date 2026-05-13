import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_TEXT_MODEL, PROMPTS, RESPONSE_SCHEMA } from '@/lib/gemini';
import { mockResponse } from '@/lib/mocks';
import type { Lang, Mode } from '@/lib/types';

export const runtime = 'nodejs';

type Body = {
  imageBase64: string;
  mimeType: string;
  mode: Mode;
  language: Lang;
  message?: string;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { imageBase64, mimeType, mode = 'auto', language = 'en', message } = body;

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
    const promptText = message ? `${basePrompt}\n\nUser request: ${message}` : basePrompt;

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
