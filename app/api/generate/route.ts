import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_IMAGE_MODEL, imagenPrompt } from '@/lib/gemini';

export const runtime = 'nodejs';

type Body = { items: string[]; mode: 'fashion' | 'home'; style?: string };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { items = [], mode = 'fashion' } = body;
  const prompt = imagenPrompt(mode, items);

  const client = geminiClient();
  if (!client) {
    console.warn('[api/generate] GEMINI_API_KEY not set → placeholder');
    return NextResponse.json({ imageBase64: '', cached: false, mock: true, prompt });
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_IMAGE_MODEL,
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as never,
    });
    console.log('[api/generate] requesting image, prompt:', prompt.slice(0, 120));
    const result = await model.generateContent(prompt);
    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    console.log('[api/generate] parts:', parts.map((p) => Object.keys(p)).flat());
    const imagePart = parts.find((p) => 'inlineData' in p && p.inlineData?.data) as
      | { inlineData: { data: string; mimeType: string } }
      | undefined;
    if (!imagePart) {
      console.warn('[api/generate] no inlineData in response, parts =', JSON.stringify(parts).slice(0, 500));
      return NextResponse.json({ imageBase64: '', cached: false, mock: true, prompt });
    }
    console.log('[api/generate] success, base64 length:', imagePart.inlineData.data.length);
    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
      cached: false,
      mock: false,
      prompt,
    });
  } catch (err) {
    console.error('[api/generate] error:', err);
    return NextResponse.json({ imageBase64: '', cached: false, mock: true, prompt });
  }
}
