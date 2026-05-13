# Oben — Agent Handbook

Source of truth for any AI agent (Claude Code, Codex, Cursor) extending Oben. Read fully before writing code.

## What Oben is
Bilingual (EN/TR) AI shopping assistant. User pastes a product URL or uploads a photo in chat. Gemini Flash analyzes it, generates localized search queries, Google Custom Search returns shoppable products. Fashion/Home modes also generate a styled Imagen 3 visual. Cart lives in `localStorage`; users click out to retailers.

No database. No auth. Only Next.js route handlers as backend.

## Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Styling | Tailwind CSS + CSS variables matching `/design` tokens |
| Font | Geist 400/500 |
| LLM | `gemini-1.5-flash` (text + vision) |
| Image gen | `gemini-2.0-flash-exp-image-generation` (same Gemini API key) |
| Product search | Google Custom Search JSON API |
| Persistence | `localStorage` only |
| Language | TypeScript strict |

## Design source
`/design/landing.html` and `/design/chat.html` are the visual spec. `chat-app.jsx`, `chat-cards.jsx`, `chat-modals.jsx`, `chat-icons.jsx`, `chat-data.jsx` are React-via-Babel prototypes — port their structure and styles into real Next.js components. Re-export the design tokens exactly (see `CLAUDE.md`).

## File map
```
/app
  page.tsx                  Landing (Vitrine background + hero)
  chat/page.tsx             Chat interface
  api/chat/route.ts         Gemini text/chat (streamed)
  api/analyze/route.ts      Gemini vision
  api/resolve/route.ts      Fetch + parse pasted product URL
  api/search/route.ts       Google CSE
  api/generate/route.ts     Gemini image gen + mock fallback
  layout.tsx                Geist font, global CSS vars
  globals.css
/components
  Vitrine.tsx               Landing infinite-scroll item rows
  ItemSvgs.tsx              SVG catalog from landing.html
  Logo.tsx                  Circle-O mark + wordmark
  LanguageToggle.tsx        EN / TR pill
  Sidebar.tsx               Chat sidebar (history + cart button)
  ModeSelector.tsx          Mode pills inside input bar
  MessageBubble.tsx
  PriceCard.tsx             Inline price-compare card
  FashionCard.tsx           Description + horizontal product strip
  HomeCard.tsx              Same shape as fashion
  ElectronicsCard.tsx       Inline spec-compare table
  ProductStrip.tsx          Horizontal scroll product chips
  LinksModal.tsx            Modal 1
  VisualModal.tsx           Modal 2 (Imagen image + chips)
  CartDrawer.tsx            Modal 3 (right slide-in)
/lib
  gemini.ts                 Flash + Imagen client, prompt tables
  search.ts                 CSE client
  cart.ts                   localStorage cart helpers
  chats.ts                  localStorage chat history
  i18n.ts                   EN/TR strings + t()
  mocks.ts                  Fallback data
  cache.ts                  Imagen sha1 cache
  types.ts
```

## Modes
| Mode | Behavior | Visual? |
|---|---|---|
| Auto | Detect product type, route | inherits |
| Price | Same product cheaper across retailers | no |
| Fashion | 5–6 complementary pieces + Imagen flat lay | yes |
| Home | 5–6 room items + Imagen room render | yes |
| Electronics | Spec compare + 3 alternatives | no |
| Beauty | 4 complementary products | no |

## API contracts

### `POST /api/chat` (streamed)
```ts
Request:  {
  message: string;
  resolvedProduct?: { title: string; image?: string; jsonLd?: object }; // from /api/resolve
  mode: Mode;
  chatHistory: Message[];
  language: "en" | "tr";
}
Response: streamed JSON tokens; final assembled = StandardResponse
```

Auto mode is **one-shot**: Gemini receives the Auto system prompt and returns a full `StandardResponse` with `mode` set to the detected category. No second classify-then-route call.

### `POST /api/resolve`
```ts
Request:  { url: string }
Response: { title: string; image?: string; jsonLd?: object } | { error: string }
```

Server-side `fetch()` with browser-like UA and 5s timeout. Parse with cheerio (or regex for `<title>` / `<meta property="og:*">` / first `<script type="application/ld+json">`). On any failure return `{ error }` — the chat UI then sends the raw URL string to `/api/chat` as a fallback.

### `POST /api/analyze`
```ts
Request:  { imageBase64: string; mimeType: string; mode: Mode; language: "en" | "tr" }
Response: StandardResponse
```

### `POST /api/search`
```ts
Request:  { query: string; mode: Mode; language: "en" | "tr" }
Response: { products: Product[] }
```

Price extraction strategy: **CSE `pagemap` rich snippets only** (no scraping, no third-party APIs).

Pipeline:
1. `customsearch.googleapis.com/customsearch/v1?q=...&num=10` with CSE key + engine ID
2. For each `item`, read in order:
   - `item.pagemap.offer[0].price` + `pagemap.offer[0].pricecurrency`
   - `item.pagemap.product[0].price`
   - `item.pagemap.metatags[0]["product:price:amount"]` + `product:price:currency`
3. Thumbnail: `item.pagemap.cse_image[0].src` → `cse_thumbnail[0].src` → fallback placeholder
4. Retailer: hostname of `item.link` (strip `www.`), title-cased
5. Dedupe by retailer (keep cheapest per host)
6. If `priced.length < 3` → pad from `mocks.products(mode, lang)`
7. Sort ascending by numeric price
8. Items without a price are kept but flagged `price: null`; UI renders "Visit for price"

Coverage notes: Trendyol, Hepsiburada, Amazon, IKEA, Zara, MediaMarkt all expose `pagemap.offer.price` reliably. Expect ~60–75% of results to have a price; mocks fill the gap.

### `POST /api/generate`
```ts
Request:  { items: string[]; mode: "fashion" | "home"; style?: string }
Response: { imageBase64: string; cached: boolean; mock: boolean }
```

Image generation strategy: **3-tier fallback** (no Vertex AI, no Imagen 3 directly).

1. **Cache** — client passes `sha1(prompt)`; check `localStorage['oben:imagen-cache:<sha1>']` BEFORE calling the route. If hit, skip the network entirely.
2. **Gemini image gen** — `gemini-2.0-flash-exp-image-generation` with the English prompt. Returns inline image data; extract base64. 4–10s typical latency.
3. **Mock fallback** — on any error (quota, region, 5xx), pick a curated file from `/public/mocks/{mode}/{style}-{1..N}.jpg` using `style` hint. If style missing, pick at random.

Triggering:
- Generation happens on **VisualModal open**, not during `/api/chat`. Chat returns `hasVisual: true` + `imagePrompt`; the modal fires `/api/generate` itself.
- UI shows labeled progress ("Generating outfit · 5s…"), not a spinner.

Cache rules:
- Key: `oben:imagen-cache:<sha1(prompt)>` (sha1 of the full English prompt string)
- Value: raw base64 (no data URL prefix)
- Cap 8 entries; on overflow, evict oldest (track via parallel `oben:imagen-cache:index` LRU list)
- ~5MB localStorage budget; base64 PNG ≈ 500KB so 8 fits comfortably

Mock asset structure (commit these to repo):
```
/public/mocks/fashion/
  minimalist-1.jpg, minimalist-2.jpg,
  classic-1.jpg, classic-2.jpg,
  streetwear-1.jpg, streetwear-2.jpg
/public/mocks/home/
  minimalist-1.jpg, scandinavian-1.jpg,
  industrial-1.jpg, mid-century-1.jpg
```

### Shared types
```ts
type Mode = "auto" | "price" | "fashion" | "home" | "electronics" | "beauty";

type Product = {
  name: string;
  price: number | null;     // numeric, e.g. 49.90 — null means CSE returned no price
  currency: string;         // "TRY" | "EUR" | "USD" — default "EUR" if missing
  thumbnail: string;
  link: string;             // retailer URL
  retailer: string;         // derived from hostname, e.g. "Trendyol"
};

type StandardResponse = {
  mode: Mode;
  text: string;                          // localized
  identifiedItem?: { name: string; type: string; color?: string; style?: string; material?: string };
  suggestions?: { name: string; type?: string; searchQuery: string; reason?: string }[];
  hasVisual: boolean;                    // true for fashion / home
  imagePrompt?: string;                  // English, ready for Imagen 3
  retailers?: Product[];
};
```

## Gemini configuration
Every call must include:
```ts
generationConfig: {
  responseMimeType: "application/json",
  responseSchema: <mode-specific schema>,
  temperature: 0.4,
}
```
System prompts live in `/lib/gemini.ts` as `PROMPTS[mode][lang]`. Imagen 3 prompts are always English.

### System prompts (per mode, per language)

**AUTO (en):** "You are Oben, an AI shopping assistant. Analyze the user's input (link or image), detect the product type, and route to the appropriate mode. Generate search queries in English. Always return structured JSON."

**AUTO (tr):** "Sen Oben adlı bir alışveriş asistanısın. Kullanıcının gönderdiği ürünü analiz et, ürün tipini belirle ve uygun moda yönlendir. Türkçe arama sorguları üret. Her zaman JSON formatında yanıt ver."

**PRICE (en):** "Find this exact product or close alternatives across multiple retailers. Generate search queries. Return JSON: { searchQuery, productName, category, brand }"

**PRICE (tr):** "Bu ürünün aynısını veya benzerini e-ticaret sitelerinde bul. Arama sorgusu üret. JSON döndür: { searchQuery, productName, category, brand }"

**FASHION (en):** "Analyze this clothing item. Extract color, style, material, fit. Suggest 5 complementary outfit pieces. Generate a search query for each. Return JSON: { identifiedItem, suggestions[], imagePrompt (English) }"

**FASHION (tr):** "Bu kıyafet parçasını analiz et. Renk, stil, materyal, kesim bilgilerini çıkar. 5 kombin parçası öner. Her biri için Türkçe arama sorgusu üret. JSON döndür: { identifiedItem, suggestions[], imagePrompt (İngilizce) }"

**HOME (en):** "Analyze this furniture or decor item. Extract style, color, material. Suggest 5 complementary room pieces. Return JSON: { identifiedItem, suggestions[], imagePrompt (English) }"

**HOME (tr):** "Bu mobilya veya dekor ürününü analiz et. Stil, renk, materyal bilgilerini çıkar. 5 uyumlu ev eşyası öner. JSON döndür: { identifiedItem, suggestions[], imagePrompt (İngilizce) }"

**ELECTRONICS (en):** "Analyze this electronic product. Extract brand, model, specs. Suggest 3 alternatives. Return JSON: { identifiedItem, alternatives[] }"

**BEAUTY (en):** "Analyze this beauty product. Extract type, ingredients, skin type. Suggest 4 complementary products. Return JSON: { identifiedItem, suggestions[] }"

### Imagen 3 prompts (always English)
**Fashion:** `Minimalist white background flat lay fashion photo. Styled outfit including: {items}. Editorial style, clean, high-end fashion magazine aesthetic. No text, no watermarks.`

**Home:** `Interior design concept render. Cozy well-lit room featuring: {items}. Clean minimalist styling, natural light, editorial aesthetic. No text, no watermarks.`

## Fallback behavior
- Missing env var → route returns mock data, never 500
- Gemini failure → return `mocks.responseFor(mode, lang)`
- CSE returns <3 results → pad with `mocks.products(mode, lang)`
- Imagen failure → Visual Modal shows placeholder + text-only suggestions

## localStorage keys
| Key | Shape |
|---|---|
| `oben:lang` | `"en" \| "tr"` |
| `oben:cart` | `CartItem[]` |
| `oben:chats` | `Chat[]` (cap 20, evict oldest) |
| `oben:imagen-cache:<sha1>` | `string` (base64, cap 8 entries LRU) |

```ts
type Chat = {
  id: string;
  title: string;          // first 40 chars of first user message
  messages: Message[];
  createdAt: number;
  lang: "en" | "tr";
};
```

## UX rules
- Esc closes all modals
- Mobile: sidebar collapses to drawer below 768px
- Cart badge updates instantly on add (uses accent `#7C2D12`)
- Language switch is instant, no flash
- Streaming chat tokens appear progressively
- Loading state = 1px-bordered skeleton, not spinners. Image gen gets a labeled progress card.
- Landing Vitrine respects `prefers-reduced-motion`

### Link paste
- When the input matches a URL regex on send, UI calls `/api/resolve` first, shows "Fetching product…" inline, then forwards the resolved product to `/api/chat`. On `/api/resolve` error, send the raw URL with a hint.
- Search query language follows `oben:lang` always, even if the resolved product is in a different language.

### Image upload
- Compress client-side via `<canvas>` to max edge 1024px, JPEG quality 0.85, before POSTing to `/api/analyze`.
- Reject files >20MB pre-compression with a localized error.

### Chat empty state
- Before the first message, show a localized welcome line + 3 example prompt chips that populate the input on click:
  - EN: "Paste a Trendyol link" · "Upload an outfit photo" · "Find cheaper headphones"
  - TR: "Trendyol linki yapıştır" · "Bir kıyafet fotoğrafı yükle" · "Daha ucuz kulaklık bul"

## TODOs reserved (do not implement unless asked)
```
// TODO: Configure CSE for preferred retail sites
// TODO: Add Trendyol Affiliate API when available
// TODO: Add price history tracking
// TODO: Add user accounts and saved looks
```

## Out of scope (do not add)
- Auth, accounts, profiles
- Server-side database
- Payment / checkout
- Analytics, telemetry
- Toasts, confetti, decorative animation
- Dark mode
- shadcn / Headless UI / Radix beyond what App Router ships. Build modals and drawers from primitives.

## Definition of done
1. Works with real API keys
2. Works without API keys (mock fallback)
3. Works in both EN and TR
4. Tested in a browser desktop + mobile widths
5. `tsc --noEmit` and `next build` pass
6. No hardcoded user-facing strings
7. Visual diff against `/design/landing.html` and `/design/chat.html` matches
