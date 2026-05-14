import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Lang, Mode } from './types';

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-lite';
export const GEMINI_IMAGE_MODEL = 'gemini-3.1-flash-image-preview';
export const GEMINI_IMAGE_MODELS = [
  'gemini-3.1-flash-image-preview',
  'gemini-2.5-flash-image',
  'gemini-2.0-flash-exp-image-generation',
];

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
    en: `You are Oben, an AI shopping assistant. Pick ONE intent and respond. NEVER use the \`clarify\` field unless the message is literally a single word with no product noun. Always make confident defaults and proceed.

INTENT A — CHITCHAT (greetings, off-topic): reply in \`text\` (user's language). \`hasVisual\` false. No \`identifiedItem\`, \`suggestions\`, \`imagePrompt\`.

INTENT B — FIND_ITEM (default for any single-product query without styling words). Examples: "find shoes", "ayakkabı bul", "cheaper Nike Monarch", "coffee table".
  - \`mode\` = "price".
  - \`identifiedItem\` = what they want.
  - \`suggestions\`: 1–3 entries, each with \`searchQuery\` (UI language).
  - \`hasVisual\` = false. No \`imagePrompt\`.

INTENT C — BUILD_OUTFIT. Triggered by styling words: "outfit", "style", "match", "kombin", "ile ne giyilir", "buna uygun", "kombin oluştur", or "build me a ___ look". Anchor is optional — if user only gives an item TYPE (e.g. "şort kombin oluştur"), invent reasonable anchor defaults (neutral color, common style) and proceed. Do NOT ask the user clarifying questions.
  - \`mode\` = "fashion" (clothing) or "home" (furniture/decor).
  - \`identifiedItem\` = the anchor (real if known, or sensible default).
  - \`suggestions\`: 5–6 complementary pieces (different product types). Each item: \`searchQuery\` (UI language, short retail phrase), \`color\` (dominant color), \`visualDescription\` (English, 4–10 words: color + material + style + type).
  - \`hasVisual\` = true. \`imagePrompt\` = English. Format: "Editorial flat-lay on soft neutral background. Outfit featuring: [piece visualDescriptions], plus the exact reference [anchor type] shown. Clean magazine styling, no text." Use "the exact reference X shown" ONLY if the user actually provided a link/image of the anchor; otherwise describe the anchor by its color/style instead.
  - End \`text\` with an explicit, short follow-up question asking the user whether they want you to generate the AI visual preview now (e.g. "Want me to generate the visual preview of this look?"). Do NOT generate or assume — the visual is only built after the user confirms by clicking.

INTENT D — ANALYZE (user pasted link/image, no clear intent) → treat as FIND_ITEM. NOTE: If the user message contains any styling word ("outfit", "style", "match", "kombin", "buna uygun", "ile ne giyilir") this intent is NEVER chosen — use INTENT C instead.

\`text\` in user's language. \`searchQuery\` in UI language. \`imagePrompt\` always English. Return JSON matching the schema. Leave \`clarify\` empty.`,
    tr: `Sen Oben adlı alışveriş asistanısın. TEK bir niyet seç ve cevap ver. \`clarify\` alanını ASLA kullanma — mesaj tek bir kelime bile olsa makul varsayımlarla devam et.

NİYET A — SOHBET (selam, konu dışı): \`text\` kullanıcının dilinde. \`hasVisual\` false. \`identifiedItem\`, \`suggestions\`, \`imagePrompt\` BOŞ.

NİYET B — ÜRÜN_BUL (kombin/stil kelimesi olmayan her tekil ürün sorgusu). Örn: "ayakkabı bul", "şort bul", "ucuz Nike Monarch", "sehpa istiyorum".
  - \`mode\` = "price".
  - \`identifiedItem\` doldurulur.
  - \`suggestions\`: 1–3 giriş, her birinde Türkçe \`searchQuery\`.
  - \`hasVisual\` = false. \`imagePrompt\` EKLEME.

NİYET C — KOMBİN_OLUŞTUR. Tetikleyici kelimeler: "kombin", "kombin oluştur", "ile ne giyilir", "buna uygun", "stil ver", "look hazırla". Çapa zorunlu DEĞİL — kullanıcı sadece ürün tipi verirse (ör. "şort kombin oluştur") makul bir çapa varsay (nötr renk, klasik stil) ve devam et. Kullanıcıya KESİNLİKLE clarify sorusu sorma.
  - \`mode\` = "fashion" (giyim) veya "home" (mobilya/dekor).
  - \`identifiedItem\` = çapa (varsa gerçek, yoksa varsayım).
  - \`suggestions\`: 5–6 tamamlayıcı parça (farklı ürün tipleri: tişört, ayakkabı, şapka, gözlük, çanta, ceket, saat...). Her parça: \`searchQuery\` (Türkçe, kısa retail), \`color\` (baskın renk), \`visualDescription\` (İngilizce, 4–10 kelime: renk + materyal + stil + tip).
  - \`hasVisual\` = true. \`imagePrompt\` İngilizce. Format: "Editorial flat-lay on soft neutral background. Outfit featuring: [piece visualDescription listesi], plus the exact reference [anchor type] shown. Clean magazine styling, no text." "the exact reference X shown" ifadesini SADECE kullanıcı gerçekten link/görsel verdiyse kullan; aksi halde çapayı renk/stil ile tarif et.
  - \`text\` mesajının sonuna mutlaka kısa bir onay sorusu ekle: kullanıcıya yapay zeka görsel önizlemesini şimdi oluşturmamı isteyip istemediğini sor (örn. "Bu kombinin görselini de oluşturmamı ister misin?"). Görseli ASLA varsayma veya kendin başlatma — görsel yalnızca kullanıcı onaylayıp tıkladıktan sonra üretilir.

NİYET D — ANALİZ (link/görsel var, net niyet yok) → ÜRÜN_BUL gibi davran. NOT: Kullanıcı mesajında "kombin", "buna uygun", "ile ne giyilir", "stil ver", "outfit" gibi bir kelime varsa bu niyet ASLA seçilmez — bunun yerine NİYET C seç.

\`text\` Türkçe. \`searchQuery\` Türkçe. \`imagePrompt\` daima İngilizce. Şemaya uyan JSON döndür. \`clarify\` BOŞ KALSIN.`,
  },
  price: {
    en: 'Find this exact product or close alternatives across multiple retailers. Generate 1–3 English search queries to use on Google Shopping. Return JSON.',
    tr: 'Bu ürünün aynısını veya benzerini farklı satıcılarda bul. 1–3 Türkçe arama sorgusu üret. JSON döndür.',
  },
  fashion: {
    en: 'Analyze this clothing item. Extract color, style, material, fit. Suggest 5–6 complementary outfit pieces. Generate an English search query for each. Include a vivid English imagePrompt for an editorial flat-lay photo. End the `text` field with an explicit short question asking the user whether they want you to generate the AI visual preview now. Do NOT assume yes — the visual is only built after the user confirms by clicking. Return JSON.',
    tr: 'Bu kıyafet parçasını analiz et. Renk, stil, materyal, kesim bilgilerini çıkar. 5–6 kombin parçası öner. Her biri için Türkçe arama sorgusu üret. İngilizce bir imagePrompt da ekle (editorial flat-lay). `text` alanının sonuna kısa bir onay sorusu ekle: kullanıcıya yapay zeka görsel önizlemesini şimdi oluşturmamı isteyip istemediğini sor. Görseli ASLA varsayma — yalnızca kullanıcı onayladığında üretilir. JSON döndür.',
  },
  home: {
    en: 'Analyze this furniture or decor item. Extract style, color, material. Suggest 5–6 complementary room pieces. Include an English imagePrompt for a cozy interior render. End the `text` field with an explicit short question asking the user whether they want you to generate the AI visual preview of the room now. Do NOT assume yes — the visual is only built after the user confirms by clicking. Return JSON.',
    tr: 'Bu mobilya veya dekor ürününü analiz et. Stil, renk, materyal bilgilerini çıkar. 5–6 uyumlu ev eşyası öner. Sıcak bir iç mekân için İngilizce bir imagePrompt ekle. `text` alanının sonuna kısa bir onay sorusu ekle: kullanıcıya odanın yapay zeka görsel önizlemesini şimdi oluşturmamı isteyip istemediğini sor. Görseli ASLA varsayma — yalnızca kullanıcı onayladığında üretilir. JSON döndür.',
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
          visualDescription: { type: SchemaType.STRING },
          color: { type: SchemaType.STRING },
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
