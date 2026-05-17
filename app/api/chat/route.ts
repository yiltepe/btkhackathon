import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_TEXT_MODEL, PROMPTS, RESPONSE_SCHEMA } from '@/lib/gemini';
import type { Budget, Gender, Lang, Mode, ResolvedProduct, Message } from '@/lib/types';
import { buildContextPreamble } from '@/lib/preamble';
import { serperWebSnippets, hasSearch } from '@/lib/search';

const SPEC_QUESTION_CUE = /\b(spec|specs|specification|specifications|feature|features|color|colour|colors|colours|colorway|options?|variant|version|battery|ram|storage|weight|dimension|resolution|refresh rate|warranty|review|reviews|compatible|compatibility|support|performance|benchmark|differences?|vs\.?|versus|compared?|which is better|good for|worth it|reliable|how (?:much|long|fast|big)|what (?:is|are|does)|available in|comes in|özellik|özellikler|teknik|batarya|pil|ekran|işlemci|kapasite|garanti|inceleme|yorum|uyumlu|destek|karşılaştır|kıyasla|fark|farkları?|hangisi|daha iyi mi|nasıl|ne kadar|kaç (?:gb|saat|inç|cm)|renk|renkleri?|renkler|seçenek|seçenekler|varyant|versiyon|nedir|neler|hangileri)\b/i;

export const runtime = 'nodejs';

type Body = {
  message: string;
  resolvedProduct?: ResolvedProduct;
  resolvedProducts?: ResolvedProduct[];
  mode: Mode;
  chatHistory?: Message[];
  language: Lang;
  gender?: Gender | null;
  budget?: Budget | null;
  prefsSummary?: string | null;
};

type ApiErrorBody = {
  error: 'missing_api_key' | 'rate_limited' | 'provider_denied' | 'provider_unavailable' | 'invalid_response';
  provider: 'gemini';
  status: number;
  retryable: boolean;
};

function providerError(status: number, error: ApiErrorBody['error'], retryable: boolean) {
  return NextResponse.json<ApiErrorBody>(
    { error, provider: 'gemini', status, retryable },
    { status },
  );
}

function mapGeminiError(err: unknown) {
  const status =
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof (err as { status?: unknown }).status === 'number'
      ? (err as { status: number }).status
      : 503;

  if (status === 429) return providerError(429, 'rate_limited', true);
  if (status === 403) return providerError(403, 'provider_denied', false);
  return providerError(status >= 400 ? status : 503, 'provider_unavailable', true);
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { message, resolvedProduct, resolvedProducts, mode = 'auto', language = 'en', chatHistory = [], gender = null, budget = null, prefsSummary = null } = body;
  const resolved: ResolvedProduct[] = resolvedProducts && resolvedProducts.length
    ? resolvedProducts
    : resolvedProduct
    ? [resolvedProduct]
    : [];

  const client = geminiClient();
  if (!client) {
    console.warn('[api/chat] GEMINI_API_KEY not set → mock response');
    return providerError(503, 'missing_api_key', false);
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_TEXT_MODEL,
      systemInstruction: PROMPTS[mode][language],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA as never,
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    });

    const HISTORY_TURNS = 16;
    const trimmed = chatHistory.slice(-HISTORY_TURNS);
    const firstUserIdx = trimmed.findIndex((m) => m.role === 'user');
    const aligned = firstUserIdx >= 0 ? trimmed.slice(firstUserIdx) : [];
    const history = aligned
      .filter((m) => typeof m.text === 'string' && m.text.trim().length > 0)
      .map((m) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text.slice(0, 4000) }],
      }));

    const userParts: string[] = [];
    const preamble = buildContextPreamble(gender, budget, language, prefsSummary);
    if (preamble) userParts.push(preamble);

    const lastAi = [...chatHistory].reverse().find((m) => m.role === 'ai');
    const priorComparison = lastAi?.response?.comparison;
    const priorSuggestionsByIdx = lastAi?.response?.suggestions?.filter((s) => typeof s.sourceIndex === 'number');
    if (priorComparison?.items?.length || (priorSuggestionsByIdx && priorSuggestionsByIdx.length)) {
      const lines: string[] = ['PRIOR PRODUCT CONTEXT (from the previous AI turn — use this when the user references items by ordinal/position):'];
      if (priorComparison?.items?.length) {
        priorComparison.items.forEach((it, i) => {
          const idx = typeof it.sourceIndex === 'number' ? it.sourceIndex : i;
          lines.push(`  [${idx + 1}] ${it.name}${it.bestFor ? ` — best for: ${it.bestFor}` : ''}${it.summary ? ` — ${it.summary}` : ''}`);
        });
        if (priorComparison.winner) lines.push(`  Prior winner: ${priorComparison.winner}`);
        if (priorComparison.verdict) lines.push(`  Prior verdict: ${priorComparison.verdict}`);
      }
      if (priorSuggestionsByIdx && priorSuggestionsByIdx.length) {
        priorSuggestionsByIdx.forEach((s) => {
          lines.push(`  [${(s.sourceIndex ?? 0) + 1}] ${s.name}${s.searchQuery ? ` (q: ${s.searchQuery})` : ''}`);
        });
      }
      const block = lines.join('\n');
      userParts.push(block.length > 1500 ? block.slice(0, 1500) + '…' : block);
    }
    const priorClarify = lastAi?.response?.clarify;
    if (priorClarify?.groups?.length) {
      const summary = priorClarify.groups
        .map((g) => `- ${g.question} (options: ${g.options.join(', ')})`)
        .join('\n');
      userParts.push(
        `IMPORTANT FOLLOW-UP RULE: In your previous turn you asked these clarifying questions:\n${summary}\nThe user's current message contains their answers to those questions. Do NOT ask any clarifying questions again. Leave \`clarify\` empty/absent. Produce a FIND_ITEM or BUILD_OUTFIT response now and bake the user's answers into \`identifiedItem\` (color/type/style/material) and into each \`suggestions[].searchQuery\` (in UI language) so retailer search returns matching results.`,
      );
    }

    const urlMatches = message.match(/https?:\/\/\S+/g) ?? [];
    const urlMatch = urlMatches[0];
    if (resolved.length > 0) {
      const multi = resolved.length > 1;
      userParts.push(
        multi
          ? `MULTIPLE PRODUCT LINKS SUCCESSFULLY FETCHED (${resolved.length} items). Refer to them by ordinal position (1st, 2nd, …) and by their actual names — never blend them into one product.`
          : `PRODUCT LINK SUCCESSFULLY FETCHED. Resolved product data:`,
      );
      resolved.forEach((p, i) => {
        const idx = multi ? `[Product ${i + 1}] ` : '';
        userParts.push(`${idx}Title: ${p.title}`);
        if (p.sourceUrl) userParts.push(`${idx}Source URL: ${p.sourceUrl}`);
        if (p.image) userParts.push(`${idx}Image URL: ${p.image}`);
        if (p.jsonLd) userParts.push(`${idx}Structured data (JSON-LD): ${JSON.stringify(p.jsonLd).slice(0, 1500)}`);
      });
      if (multi) {
        userParts.push(
          `REQUIRED — for MULTI_ITEM intent set \`sourceIndex\` (0-based) on every \`suggestions[]\` and \`comparison.items[]\` entry to map back to which user product it refers to.`,
        );
      } else {
        userParts.push(
          `REQUIRED — use this resolved data; do NOT invent product details. ` +
          `Your \`text\` response MUST reference the actual product (its type, color, or distinctive name from the title) so the user can tell you read the page. ` +
          (language === 'tr'
            ? `Example: "Trivium baskılı siyah kadın tişörtün etrafında günlük bir kombin oluşturdum: …" — NOT "Bu tişörtle bir kombin oluşturalım".`
            : `Example: "I built a casual look around your Trivium-print black women's tee: …" — NOT "Let's build an outfit with this t-shirt".`),
        );
      }
    } else if (urlMatch) {
      userParts.push(
        `IMPORTANT — LINK COULD NOT BE FETCHED: The user pasted a URL (${urlMatch[0]}) but we could NOT access the page. You have ZERO information about what the actual product looks like beyond what the user typed in their message. Do NOT pretend you analyzed the link.\n\n` +
        `RULES:\n` +
        `1. If the user message provides any context (item type, outfit request, style keyword, product noun like "tişört"/"shoes"), PROCEED using ONLY that context. Do NOT ask for more info.\n` +
        `2. Your \`text\` response MUST OPEN with one short honest sentence stating you couldn't access the link, then state your assumption. ` +
        (language === 'tr'
          ? `Example: "Linke erişemedim, mesajından kadın tişörtü olduğunu anlayarak şu kombini hazırladım:" then describe the outfit, then the visual question. `
          : `Example: "I couldn't access that page; based on your message I built a look assuming a women's t-shirt:" then describe the outfit, then the visual question. `) +
        `NEVER skip this disclosure — the user must know the link wasn't read.\n` +
        `3. Do NOT invent specific product details (exact color, brand, print) that you can't know.\n` +
        `4. Only ask the user to describe the item if their message contains absolutely zero hint about what it is.`,
      );
    }
    const productAnchorName =
      resolved[0]?.title ||
      lastAi?.response?.identifiedItem?.name ||
      lastAi?.response?.comparison?.items?.[0]?.name ||
      null;
    const looksLikeSpecQuestion = SPEC_QUESTION_CUE.test(message);
    if (looksLikeSpecQuestion && hasSearch()) {
      try {
        const q = productAnchorName
          ? `${productAnchorName} ${message}`
          : message;
        const cleaned = q.replace(/\s+/g, ' ').trim().slice(0, 200);
        const snippets = await serperWebSnippets(cleaned, language, 6);
        if (snippets.length) {
          const lines = ['WEB SEARCH RESULTS (use these as GROUND TRUTH for specs / features / colors / variants / comparisons — quote concrete attributes from them, do NOT invent. If the user asked for color options, list every distinct color name you can read from these snippets):'];
          snippets.forEach((s, i) => {
            lines.push(`  [${i + 1}] ${s.title}${s.source ? ` (${s.source})` : ''}: ${s.snippet.slice(0, 320)}`);
          });
          userParts.push(lines.join('\n'));
          userParts.push(
            `SPEC-QUESTION ROUTING: The user is asking about characteristics of a product (specs, colors, variants, features, comparison). Pick INTENT E (PRODUCT_QA). Set \`mode\`="chitchat", \`hasVisual\`=false, OMIT \`suggestions\` and \`retailers\`. Answer the question directly in \`text\` using the WEB SEARCH RESULTS above. Do NOT return a price comparison.`,
          );
          console.log(`[api/chat] injected ${snippets.length} web snippets for spec question (anchor: ${productAnchorName ?? 'from-message'})`);
        }
      } catch (snippetErr) {
        console.warn('[api/chat] web snippet fetch failed:', snippetErr);
      }
    }

    userParts.push(`User message: ${message}`);

    const chat = model.startChat({ history });
    const userMessage = userParts.join('\n\n');

    console.log('\n========== [api/chat] GEMINI REQUEST ==========');
    console.log('Model:', GEMINI_TEXT_MODEL, '| mode:', mode, '| lang:', language);
    console.log('--- System Instruction ---');
    console.log(PROMPTS[mode][language]);
    console.log('--- History (', history.length, 'turns ) ---');
    history.forEach((h, i) => console.log(`[${i}] ${h.role}: ${h.parts[0].text.slice(0, 300)}${h.parts[0].text.length > 300 ? '…' : ''}`));
    console.log('--- User Message ---');
    console.log(userMessage);
    console.log('================================================\n');

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();
    const usage = result.response.usageMetadata;
    console.log('========== [api/chat] GEMINI RESPONSE ==========');
    if (usage) {
      console.log(`Tokens → prompt: ${usage.promptTokenCount} | output: ${usage.candidatesTokenCount} | total: ${usage.totalTokenCount}`);
    } else {
      console.log('Tokens → (no usageMetadata returned)');
    }
    console.log('--- Response Text ---');
    console.log(text);
    console.log('================================================\n');

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.suggestions)) {
        for (const s of parsed.suggestions) {
          if (typeof s.visualDescription === 'string' && s.visualDescription.length > 120) {
            s.visualDescription = s.visualDescription.split(/[.,;]/)[0].trim().slice(0, 100);
          }
        }
      }
      return NextResponse.json(parsed);
    } catch (parseErr) {
      console.error('[api/chat] JSON parse failed; raw text was:\n', text);
      console.error('[api/chat] parse error:', parseErr);
      return providerError(502, 'invalid_response', true);
    }
  } catch (err) {
    console.error('[api/chat] Gemini error → falling back to mock:', err);
    return mapGeminiError(err);
  }
}
