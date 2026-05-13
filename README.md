# OBEN

Bilingual (EN/TR) AI shopping concierge. Paste a product link or upload a photo — Gemini analyzes it, Google Custom Search finds shoppable matches across retailers, and Fashion/Home modes generate a styled visual.

No database. No auth. Cart, chat history, and image cache all live in `localStorage`.

## Stack

- **Framework**: Next.js 14 (App Router) · TypeScript strict
- **Styling**: Tailwind CSS + CSS variables (design tokens from `/design`)
- **Font**: Geist 400/500
- **LLM**: `gemini-1.5-flash` (text + vision)
- **Image gen**: `gemini-2.0-flash-exp-image-generation`
- **Product search**: Google Custom Search JSON API (price extracted from CSE `pagemap` rich snippets — no scraping)
- **Persistence**: `localStorage` only

## Prerequisites

- Node.js **18.18+** (Next.js 14 requirement)
- npm 9+

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your keys (all optional — see "Running without API keys" below)
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>. The landing page loads with the Vitrine background; click **Get Started** to open the chat at `/chat`.

## Environment variables

All three are optional. If any are missing, the corresponding route returns mocked data instead of failing — the demo never breaks.

| Variable | Used by | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `/api/chat`, `/api/analyze`, `/api/generate` | Gemini Flash + image generation |
| `GOOGLE_CUSTOM_SEARCH_API_KEY` | `/api/search` | Google Custom Search JSON API |
| `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` | `/api/search` | Your Programmable Search Engine ID |

Get keys at:

- Gemini: <https://aistudio.google.com/apikey>
- Custom Search: <https://developers.google.com/custom-search/v1/overview> (key) + <https://programmablesearchengine.google.com> (engine ID, enable "Search the entire web")

## Running without API keys

The app is intentionally tolerant — every route handler falls back to curated mocks in `lib/mocks.ts`. You can run the full UI flow (chat, modals, cart, language toggle, visual modal placeholder) with an empty `.env.local`. This is also what powers the demo when CSE hits its 100/day free quota.

## Scripts

```bash
npm run dev         # Next.js dev server (http://localhost:3000)
npm run build       # Production build
npm run start       # Run the production build
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
```

## Project structure

```
app/
  page.tsx                  Landing (Vitrine + hero)
  chat/page.tsx             Chat interface
  api/chat/route.ts         Gemini text/chat
  api/analyze/route.ts      Gemini vision
  api/resolve/route.ts      Server-side fetch + parse pasted URL
  api/search/route.ts       Google Custom Search
  api/generate/route.ts     Gemini image generation
  layout.tsx, globals.css

components/
  Vitrine.tsx, ItemSvgs.tsx Landing background
  Logo.tsx, LanguageToggle.tsx
  Sidebar.tsx, InputBar.tsx, ModeSelector.tsx
  PriceCard.tsx             Inline retailer price-compare table
  LookCard.tsx              Fashion / Home description + product strip
  ProductStrip.tsx, Thumbnail.tsx, Icons.tsx, Overlay.tsx
  LinksModal.tsx            "See all retailers" modal
  VisualModal.tsx           Generated outfit / room image
  CartDrawer.tsx            Right-side cart slide-in

lib/
  types.ts                  Canonical shapes
  i18n.ts                   EN/TR string table + t()
  mocks.ts                  Fallback responses + product padding
  gemini.ts                 Client, prompts, response schema
  search.ts                 CSE client + price extraction
  cart.ts, chats.ts         localStorage helpers
  cache.ts                  sha1 + LRU image cache (cap 8)
  format.ts, image.ts       Price formatter, canvas compression

design/                     Source-of-truth HTML/JSX prototypes
CLAUDE.md, AGENTS.md        Engineering and design rules
```

## How it works

### Modes

| Mode | Behavior | Visual |
|---|---|---|
| **Auto** | One-shot Gemini call detects the type and routes | inherits |
| **Price** | Same product across retailers, sorted ascending | no |
| **Fashion** | 5–6 complementary pieces + generated flat-lay | yes |
| **Home** | 5–6 room pieces + generated room render | yes |
| **Electronics** | Spec compare + 3 alternatives | no |
| **Beauty** | 4 complementary products | no |

### Link paste flow

1. Input matches a URL regex → UI shows "Fetching product…" and calls `POST /api/resolve`
2. The route fetches the page server-side (5s timeout, browser UA), extracts `<title>` / `og:title` / `og:image` / JSON-LD `Product`
3. The structured payload is passed to `/api/chat` as `resolvedProduct` (raw URLs are never sent to Gemini — they hallucinate badly)
4. Search queries always use the **UI language**, regardless of the source page's language

### Image upload

Client-side compression via `<canvas>` to max edge 1024px, JPEG quality 0.85, before POSTing to `/api/analyze`. Files >20MB are rejected with a localized error.

### Price extraction

CSE `pagemap` rich snippets only — no scraping, no third-party APIs.

Pipeline:

1. `customsearch.googleapis.com/customsearch/v1?q=…&num=10`
2. Read `item.pagemap.offer[0].price` → `pagemap.product[0].price` → `pagemap.metatags[0]["product:price:amount"]`
3. Dedupe by retailer hostname, keeping the cheapest per host
4. Sort ascending; items without a price are shown but labeled "Visit for price"
5. If fewer than 3 results have prices, pad from `lib/mocks.ts`

### Image generation

3-tier fallback in `/api/generate`:

1. **Cache** — client checks `localStorage['oben:imagen-cache:<sha1(prompt)>']` before calling the route. Cap 8 entries, LRU eviction.
2. **Gemini image gen** with the English prompt. Returns inline base64.
3. **Mock fallback** — placeholder card if Gemini fails or quota is exhausted. (You can drop curated JPEGs into `/public/mocks/{mode}/` to upgrade the fallback visuals.)

Generation fires when the user opens the Visual Modal, not during `/api/chat` — keeps chat snappy.

### localStorage keys

| Key | Shape |
|---|---|
| `oben:lang` | `"en" \| "tr"` |
| `oben:cart` | `CartItem[]` |
| `oben:chats` | `Chat[]` (cap 20, evict oldest) |
| `oben:imagen-cache:<sha1>` | base64 string (cap 8 entries, LRU) |
| `oben:imagen-cache:index` | LRU order array |

## Language toggle

EN/TR pill in the top-right of both pages. Switches instantly, persists in `oben:lang`. The selected language drives:

- Every UI string (`lib/i18n.ts`)
- Gemini system prompts
- Google Custom Search `hl` (and `gl=tr` for Turkish)

Image-generation prompts stay English — Turkish prompts produce visibly worse output.

## Troubleshooting

- **`tsc` errors after pulling**: `rm -rf .next` then `npm run typecheck`.
- **CSE returns 429**: free tier is 100 queries/day. The app silently falls back to mocks.
- **Gemini returns text but parsing fails**: every Gemini call sets `responseMimeType: "application/json"` AND a `responseSchema` — if you see fallback mocks instead of real responses, check that your API key has access to `gemini-1.5-flash`.
- **Image gen returns placeholder**: `gemini-2.0-flash-exp-image-generation` is preview-tier; if it's region-blocked or 5xx, the modal shows a placeholder card. Drop curated mocks in `/public/mocks/{fashion,home}/` to upgrade.

## License

Hackathon project — not licensed for redistribution.
