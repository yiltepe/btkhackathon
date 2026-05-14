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

    const preamble = buildContextPreamble(gender, budget, language);
    const parts = [preamble, message ?? ''].filter(Boolean);
    const promptText = parts.join('\n\n');

    console.log('\n========== [api/analyze] GEMINI REQUEST ==========');
    console.log('Model:', GEMINI_TEXT_MODEL, '| mode:', mode, '| lang:', language);
    console.log('--- System Instruction ---');
    console.log(PROMPTS[mode][language]);
    console.log('--- Image ---');
    console.log(`mimeType: ${mimeType || 'image/jpeg'} | base64 length: ${imageBase64?.length ?? 0}`);
    console.log('--- Prompt Text ---');
    console.log(promptText);
    console.log('==================================================\n');

    const result = await model.generateContent([
      {
        inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' },
      },
      { text: promptText },
    ]);
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
      return NextResponse.json(mockResponse(mode, language, '[image]'));
    }
  } catch (err) {
    console.error('[api/analyze] Gemini error → falling back to mock:', err);
    return NextResponse.json(mockResponse(mode, language, '[image]'));
  }
}
