# Oben

Bilingual (EN/TR) AI shopping assistant. Paste a product URL or upload a photo, and Oben analyzes it with Gemini, generates localized search queries, and returns shoppable results across retailers. Fashion and Home modes also generate a styled visual for the look.

Built for the BTK Hackathon.

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS, Geist font, custom design tokens
- **LLM**: Gemini 1.5 Flash (text + vision), Gemini 2.0 image generation
- **Search**: Serper.dev (Google Shopping + organic fallback)
- **Auth**: Clerk
- **Persistence**: Supabase Postgres for user state; `localStorage` for client cache

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

Open http://localhost:3000.

### Required environment variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini text, vision, and image generation |
| `SERPER_API_KEY` | Product search (optional — falls back to mocks) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth (client) |
| `CLERK_SECRET_KEY` | Clerk auth (server) |
| `SUPABASE_URL` | User state storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase access |

Missing keys won't 500 — API routes return mock data so the UI stays usable.

The Supabase schema lives in [`supabase/schema.sql`](supabase/schema.sql). Run it once in the Supabase SQL editor.

## Project layout

```
app/                 Next.js routes (pages + API handlers)
  api/chat           Streaming Gemini chat
  api/analyze        Gemini vision for uploaded images
  api/resolve        Server-side product URL fetch + parse
  api/search         Serper search wrapper
  api/generate       Gemini image generation with mock fallback
  api/lens           Reverse-image product search
  api/state          Supabase user state read/write
components/          Client components (chat, modals, cards, drawer)
lib/                 Gemini/Supabase/search clients, i18n, types, mocks
design/              Authoritative visual reference (HTML + JSX prototypes)
public/vitrine/      Landing-page imagery
```

See [`AGENTS.md`](AGENTS.md) for the full architecture handbook and [`CLAUDE.md`](CLAUDE.md) for design tokens and conventions.

## Scripts

- `npm run dev` — local dev server
- `npm run build` / `npm run start` — production build + serve
- `npm run lint` — Next.js lint
- `npm run typecheck` — strict TS check

## Deployment

Designed for Vercel (Hobby tier is sufficient). Set the env vars from `.env.example` in the project settings and deploy from `main`.
