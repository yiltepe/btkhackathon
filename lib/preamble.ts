import type { Budget, Gender, Lang } from './types';

const GENDER_LABEL: Record<Gender, { en: string; tr: string }> = {
  men: { en: "men's items", tr: 'erkek ürünleri' },
  women: { en: "women's items", tr: 'kadın ürünleri' },
  unisex: { en: 'unisex items', tr: 'unisex ürünler' },
};

function budgetLine(b: Budget, lang: Lang): string {
  const cur = b.currency;
  if (b.min !== null && b.max !== null) return `${b.min}–${b.max} ${cur}`;
  if (b.max !== null) return lang === 'tr' ? `en fazla ${b.max} ${cur}` : `up to ${b.max} ${cur}`;
  if (b.min !== null) return lang === 'tr' ? `en az ${b.min} ${cur}` : `at least ${b.min} ${cur}`;
  return '';
}

export function buildContextPreamble(gender: Gender | null, budget: Budget | null, lang: Lang, prefsSummary?: string | null): string {
  const lines: string[] = [];
  if (gender) {
    lines.push(`User shops for: ${GENDER_LABEL[gender][lang]}.`);
  }
  if (budget && (budget.min !== null || budget.max !== null)) {
    lines.push(`User budget per item: ${budgetLine(budget, lang)}. Stay within this range when suggesting products and search queries; if the requested item cannot reasonably fit, mention it briefly.`);
  }
  if (prefsSummary && prefsSummary.trim()) {
    lines.push(`Known preferences (rolling summary from prior turns): ${prefsSummary.trim()}. Honor these unless the user contradicts. Refresh your own \`prefsSummary\` field at the end of this turn.`);
  }
  lines.push(
    'CLARIFY RULE: Only ask clarifying questions when the request is genuinely too vague to act on (e.g. "find me shorts", "I need shoes"). When you do clarify, DO NOT generate suggestions, identifiedItem, or imagePrompt yet — respond with a brief friendly `text` (in the user\'s language) and populate `clarify.groups`, each `{ question, options[] }`. Pick ONLY the dimensions that actually matter for the specific item, and skip any dimension the user has already specified.',
  );
  lines.push(
    'DIMENSION SELECTION (be selective — most items need 1–2 groups, never more than 3):',
  );
  lines.push(
    '- COLOR: only when the item has many obvious color choices AND the user gave no color/style hint. Do NOT ask color for items where color is rarely the deciding factor (watches, electronics, fragrances, books, basic white tees, etc.). Never ask color reflexively — skip it by default.',
  );
  lines.push(
    '- BODY SIZE (XS–XXL or numeric) only for body-fitted clothing: shirts, t-shirts, pants, jeans, jackets, coats, dresses, skirts, shorts, suits. Do NOT ask size for accessories, bags, hats, scarves, jewelry, sunglasses, swimwear bottoms ambiguously, etc.',
  );
  lines.push(
    '- SHOE SIZE only for shoes/boots/sneakers.',
  );
  lines.push(
    '- STYLE / USE-CASE only when occasion materially changes the recommendation (e.g. "shoes" → casual/sport/formal; "dress" → daytime/evening/wedding). Skip for items where style is implied.',
  );
  lines.push(
    '- For furniture/home items, ask ROOM or DIMENSION instead of color/size when relevant.',
  );
  lines.push(
    'Always set `clarify.allowOther: true`. Keep each option short (1–3 words). Do NOT populate clarify when the user already specified the missing dimensions, or when a product link/image is provided, or for greetings/off-topic, or when sensible defaults exist (just proceed).',
  );
  return lines.join('\n');
}
