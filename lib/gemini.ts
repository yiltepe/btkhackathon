import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Lang, Mode } from './types';

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
export const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

export function hasGemini(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export function geminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export const PROMPTS: Record<Mode, Record<Lang, string>> = {
  auto: {
    en: 'You are Oben, an AI shopping assistant. ONLY treat the message as a shopping query if the user is clearly asking to buy, compare, find, or style a product (e.g. a product link, a description of a product, or words like "find", "buy", "cheaper", "outfit", "furnish"). For greetings, small talk, off-topic questions, general conversation, or if the user uploads an image where the specific product to analyze is unclear (e.g. a general photo of a person without a clear item specified): respond in `text` naturally (in the user\'s language asking for clarification if needed), set `hasVisual` to false, and DO NOT populate `identifiedItem`, `suggestions`, or `imagePrompt`. When it IS a clear shopping query: detect product type, set `mode` to the right category (price, fashion, home, electronics, beauty), populate `identifiedItem`, generate `suggestions[]` with English `searchQuery` fields, and include an English `imagePrompt` only for fashion/home (set hasVisual true). Always return JSON matching the schema.',
    tr: 'Sen Oben adlı bir alışveriş asistanısın. Mesajı SADECE kullanıcı net bir şekilde bir ürün almak, karşılaştırmak, bulmak veya kombinlemek istiyorsa alışveriş sorgusu olarak değerlendir (ör. ürün linki, ürün tarifi veya "bul", "al", "ucuz", "kombin", "döşe" gibi kelimeler). Selamlaşma, sohbet, konu dışı sorular, genel diyalog için veya kullanıcı analiz edilecek net bir ürün içermeyen genel bir fotoğraf yüklediyse (örneğin odakta net bir kıyafet/eşya olmayan bir insan fotoğrafı): `text` alanında doğal şekilde (kullanıcının dilinde gerekirse detayı sorarak) cevap ver, `hasVisual`\'i false yap ve `identifiedItem`, `suggestions`, `imagePrompt` alanlarını DOLDURMA. Net bir alışveriş sorgusu OLDUĞUNDA: ürün tipini belirle, `mode`\'u uygun kategoriye ayarla (price, fashion, home, electronics, beauty), `identifiedItem`\'i doldur, `suggestions[]` üret (her birinde Türkçe `searchQuery` olsun), sadece fashion/home için `imagePrompt`\'i (İngilizce) ekle ve hasVisual\'i true yap. Şemaya uygun JSON döndür.',
  },
  price: {
    en: 'Find this exact product or close alternatives across multiple retailers. Generate 1–3 English search queries to use on Google Shopping. Return JSON.',
    tr: 'Bu ürünün aynısını veya benzerini farklı satıcılarda bul. 1–3 Türkçe arama sorgusu üret. JSON döndür.',
  },
  fashion: {
    en: 'Analyze this clothing item. Extract color, style, material, fit. Suggest 5–6 complementary outfit pieces. Generate an English search query for each. Include a vivid English imagePrompt for an editorial flat-lay photo. Return JSON.',
    tr: 'Bu kıyafet parçasını analiz et. Renk, stil, materyal, kesim bilgilerini çıkar. 5–6 kombin parçası öner. Her biri için Türkçe arama sorgusu üret. İngilizce bir imagePrompt da ekle (editorial flat-lay). JSON döndür.',
  },
  home: {
    en: 'Analyze this furniture or decor item. Extract style, color, material. Suggest 5–6 complementary room pieces. Include an English imagePrompt for a cozy interior render. Return JSON.',
    tr: 'Bu mobilya veya dekor ürününü analiz et. Stil, renk, materyal bilgilerini çıkar. 5–6 uyumlu ev eşyası öner. Sıcak bir iç mekân için İngilizce bir imagePrompt ekle. JSON döndür.',
  },
  electronics: {
    en: 'Analyze this electronic product. Extract brand, model, specs. Suggest 3 alternatives with English search queries. Return JSON.',
    tr: 'Bu elektronik ürünü analiz et. Marka, model, özellikleri çıkar. Türkçe arama sorgularıyla 3 alternatif öner. JSON döndür.',
  },
  beauty: {
    en: 'Analyze this beauty product. Extract type, ingredients, skin type. Suggest 4 complementary products with English search queries. Return JSON.',
    tr: 'Bu kozmetik ürününü analiz et. Tip, içerik, cilt tipi. Türkçe arama sorgularıyla 4 tamamlayıcı ürün öner. JSON döndür.',
  },
};

export const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    mode: { type: SchemaType.STRING },
    text: { type: SchemaType.STRING },
    hasVisual: { type: SchemaType.BOOLEAN },
    imagePrompt: { type: SchemaType.STRING },
    identifiedItem: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        type: { type: SchemaType.STRING },
        color: { type: SchemaType.STRING },
        style: { type: SchemaType.STRING },
        material: { type: SchemaType.STRING },
      },
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING },
          searchQuery: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
        },
        required: ['name', 'searchQuery'],
      },
    },
    clarify: {
      type: SchemaType.OBJECT,
      properties: {
        groups: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ['question', 'options'],
          },
        },
        allowOther: { type: SchemaType.BOOLEAN },
      },
    },
  },
  required: ['mode', 'text', 'hasVisual'],
};

export function imagenPrompt(mode: 'fashion' | 'home', items: string[]): string {
  const list = items.join(', ');
  if (mode === 'fashion') {
    return `Minimalist white background flat lay fashion photo. Styled outfit including: ${list}. Editorial style, clean, high-end fashion magazine aesthetic. No text, no watermarks.`;
  }
  return `Interior design concept render. Cozy well-lit room featuring: ${list}. Clean minimalist styling, natural light, editorial aesthetic. No text, no watermarks.`;
}
