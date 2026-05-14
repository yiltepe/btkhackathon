# Oben — Claude Code Instructions

Bilingual (EN/TR) AI shopping assistant. Next.js 14 App Router · Tailwind · Gemini 1.5 Flash · Imagen 3 · Google Custom Search. No DB, no auth. All client state in `localStorage`.

## Read first
- `AGENTS.md` — full architecture, file map, API contracts, prompts
- `/design/` — authoritative visual reference (`landing.html`, `chat.html`, `chat-*.jsx`). Match these pixel-for-pixel, not generic Tailwind defaults.
- `/lib/i18n.ts` — every user-facing string
- `/lib/types.ts` — canonical shapes

## Non-negotiable rules

### Design tokens (from `/design`)
- Font: **Geist** (`@fontsource/geist` or Google Fonts), weights 400 & 500 only. Fallback `'Söhne','Inter',system-ui`.
- `--bg #FAFAF8` · `--bg-soft #FFFFFF` · `--ink #111111` · `--muted #7A7A75` · `--muted-2 #9A9A93`
- `--line #E5E5E5` · `--line-soft #EDEDEA` · `--pill #F0F0EE` · `--pill-hover #E8E7E2`
- **Accent `#7C2D12`** (terracotta), hover `#5A1F0C`. Used for CTA, cart badge, price highlight. Do NOT use `#111111` as accent.
- Radius max 6px. Shadow max `0 1px 4px rgba(0,0,0,.06)`. Modal shadow `0 1px 4px rgba(0,0,0,.06), 0 20px 60px -30px rgba(0,0,0,.18)`.
- Letter spacing `-0.005em` body, `-0.045em` on the wordmark.
- Logo: 22px circle, 1.25px `--ink` border, "O" inside, "OBEN" wordmark next to it.
- AI messages: no bubble, left-aligned. User messages: `#F0F0EE` pill, right-aligned.
- Scrollbars: 8px thumb `#D8D5CE`, hover `#B5B1A8`.
- Reference editorial style: Linear.app, Stripe.com, COS.com. NOT a ChatGPT clone. No gradients, no dark panels, no decorative animation beyond the landing Vitrine drift.

### i18n
- NEVER hardcode user-facing strings. Pull from `/lib/i18n.ts` via `t(key)`.
- Adding a string = add both `en` and `tr` in the same commit.
- Language toggle (EN/TR pill, top nav both pages) switches instantly; persist in `localStorage['oben:lang']`. Default `"en"`.
- Send Gemini chat/analyze prompts in the selected language. Imagen 3 prompts stay **English always**.

### Gemini calls
- Always set `responseMimeType: "application/json"` AND a `responseSchema`. Do not rely on prose "return JSON" alone.
- Stream `/api/chat` with `generateContentStream`.
- On any Gemini failure → return mock data from `/lib/mocks.ts`. Demo must never break.

### Link paste handling
- When the input value matches a URL regex, the chat UI calls **`POST /api/resolve`** before `/api/chat`.
- `/api/resolve` server-side `fetch()`es the page (5s timeout, browser-like UA), extracts `<title>`, `og:title`, `og:image`, and the first `<script type="application/ld+json">` Product block. Returns `{ title, image, jsonLd }`.
- That structured payload is passed into `/api/chat` as part of the message. Do NOT pass raw URLs to Gemini — it hallucinates product details.
- If `/api/resolve` fails (CORS, 403, timeout) → fall back to passing the URL string with a note to Gemini.
- UI shows "Fetching product…" inline while resolving.

### Auto mode
- **One-shot classification.** The Auto system prompt asks Gemini to detect the product type and return the full StandardResponse in one call, with `mode` set to the resolved category. Do NOT make a second classify-then-route call.

### Search query language
- Search queries always use the **UI language** (`oben:lang`), regardless of the source content's language. A TR user pasting an English link gets Turkish search queries → Turkish retailers.

### Chat history
- Shape: `{ id, title, messages, createdAt, lang }`. Title = first 40 chars of the first user message, trimmed. No Gemini call for titling.
- Cap: keep last 20 chats; evict oldest on overflow.

### Image upload
- Compress client-side before POST: max edge 1024px, JPEG quality 0.85, via `<canvas>`. Reject files >20MB pre-compression.
- This keeps the base64 payload under Vercel's 4.5MB request limit.

### Chat empty state
- Before the first message: localized welcome line + 3 example prompt chips (e.g. "Paste a Trendyol link", "Upload an outfit photo", "Find cheaper headphones"). Chips populate the input on click.

### Image generation
- Model: **`gemini-2.0-flash-exp-image-generation`** via the same `GEMINI_API_KEY`. Do NOT use Vertex AI Imagen 3 — setup is too heavy for hackathon scope.
- 3-tier fallback in `/api/generate`:
  1. `localStorage['oben:imagen-cache:<sha1(prompt)>']` hit → return cached base64
  2. Call Gemini image gen with English prompt → cache + return
  3. On error/quota → return a curated mock from `/public/mocks/{mode}/` matched by `identifiedItem.style`
- Generate is triggered when the user opens VisualModal, NOT during chat response. Keeps chat snappy.
- Loading state: labeled progress text ("Generating outfit · 5s…"), not a spinner.
- Prompts are always English (Turkish prompts produce visibly worse output).
- Cache cap: 8 entries; prune oldest by insertion time.

### Search & price extraction
- **Provider: Serper.dev** (Google CSE was retired). Free tier: 2,500 queries. Do NOT scrape retailer pages, do NOT use SerpApi.
- `/api/search` pipeline:
  1. Call `POST https://google.serper.dev/shopping` with `{ q, num: 10, gl, hl }` derived from UI language
  2. Map each `shopping[]` item → `Product` (price parsed from string, currency detected from symbol)
  3. If fewer than 3 priced results → also call `/search` and merge organic items
  4. Dedupe by `source` (retailer), keeping the cheapest per retailer
  5. Sort ascending by numeric price; if still <3 priced results, pad from `/lib/mocks.ts`
- Price strings include locale formatting (e.g. `₺48.048,99`, `$1,299.00`) — parser handles both `,`/`.` decimal conventions via currency-aware fallback.
- Items with no extractable price are shown but labeled "Visit for price" (no fake values).
- Never show an empty product strip.

### Code style
- Server components by default. `"use client"` only where required (modals, chat input, cart drawer, language toggle, infinite Vitrine).
- No barrel files. Direct imports.
- Default to no comments. Only write a comment when the WHY is non-obvious.
- Don't add features the plan doesn't list. No analytics, no toasts, no animation beyond the Vitrine drift and message fade-in.

## Working on UI
Start `next dev` and verify in the browser. Type-check passing ≠ UI works. The `/design/*.html` files open standalone in a browser — diff against them visually.

## Environment variables
Required: `GEMINI_API_KEY`, `SERPER_API_KEY`.
If any are missing, route handlers return mocks — never 500.

## Commit conventions
Short imperative subject lines. No co-author tags unless asked.
