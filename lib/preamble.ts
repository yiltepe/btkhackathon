import type { Budget, Gender, Lang } from './types';

const GENDER_LABEL: Record<Gender, { en: string; tr: string }> = {
  men: { en: "men's items", tr: 'erkek ürünleri' },
  women: { en: "women's items", tr: 'kadın ürünleri' },
  unisex: { en: 'unisex items', tr: 'unisex ürünler' },
};

function budgetLine(b: Budget): string {
  const cur = b.currency;
  if (b.min !== null && b.max !== null) return `${b.min}–${b.max} ${cur}`;
  if (b.max !== null) return `up to ${b.max} ${cur}`;
  if (b.min !== null) return `at least ${b.min} ${cur}`;
  return '';
}

export function buildContextPreamble(gender: Gender | null, budget: Budget | null, lang: Lang): string {
  const lines: string[] = [];
  if (gender) {
    lines.push(`User shops for: ${GENDER_LABEL[gender][lang]}.`);
  }
  if (budget && (budget.min !== null || budget.max !== null)) {
    lines.push(`User budget per item: ${budgetLine(budget)}. Stay within this range when suggesting products and search queries; if the requested item cannot reasonably fit, mention it briefly.`);
  }
  lines.push(
    'CLARIFY RULE: If the user request is too vague to give a useful answer (e.g. "find me shorts", "I need shoes", "a nice bag"), DO NOT generate suggestions, identifiedItem, or imagePrompt yet. Instead respond with a brief friendly `text` (in the user\'s language) and populate `clarify` with multiple `groups`, each `{ question, options[] }`. Ask the relevant dimensions ALL AT ONCE:',
  );
  lines.push(
    '- Always include a COLOR group (3–6 common colors in the user\'s language).',
  );
  lines.push(
    '- For clothing (shirts, pants, jackets, dresses, shorts, etc.) include a BODY SIZE group with options like XS, S, M, L, XL, XXL (or numeric sizes if more natural).',
  );
  lines.push(
    '- For shoes include a SHOE SIZE group (EU sizes 36–46, or whatever fits the user locale).',
  );
  lines.push(
    '- For any item include a STYLE / USE-CASE group (3–5 options like "casual", "sport", "formal", "beach", etc., translated).',
  );
  lines.push(
    'ALWAYS set `clarify.allowOther: true` so the UI shows a free-text option for anything not in the chips. Keep each option short (1–3 words). Do NOT populate clarify when the user already specified the missing dimensions, or when a product link/image is provided, or for greetings/off-topic.',
  );
  return lines.join(' ');
}
