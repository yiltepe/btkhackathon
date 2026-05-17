import type { Budget, Gender, Lang } from './types';

const GENDER_BASE = 'oben:gender';
const BUDGET_BASE = 'oben:budget';
const PREFS_SUMMARY_BASE = 'oben:prefs-summary';

export const GENDER_KEY = GENDER_BASE;
export const BUDGET_KEY = BUDGET_BASE;
export const PREFS_SUMMARY_KEY = PREFS_SUMMARY_BASE;

function k(base: string, uid?: string | null): string {
  return uid ? `${base}:${uid}` : base;
}

export function loadPrefsSummary(uid?: string | null): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(k(PREFS_SUMMARY_BASE, uid)) || '';
}

export function savePrefsSummary(s: string, uid?: string | null): void {
  if (typeof window === 'undefined') return;
  const trimmed = (s || '').slice(0, 200).trim();
  const key = k(PREFS_SUMMARY_BASE, uid);
  if (trimmed) window.localStorage.setItem(key, trimmed);
  else window.localStorage.removeItem(key);
}

export function loadGender(uid?: string | null): Gender | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(k(GENDER_BASE, uid));
  return v === 'men' || v === 'women' || v === 'unisex' ? v : null;
}

export function saveGender(g: Gender, uid?: string | null): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(k(GENDER_BASE, uid), g);
}

export function defaultBudget(lang: Lang): Budget {
  return { min: null, max: null, currency: lang === 'tr' ? 'TRY' : 'USD' };
}

export function loadBudget(lang: Lang, uid?: string | null): Budget {
  if (typeof window === 'undefined') return defaultBudget(lang);
  const raw = window.localStorage.getItem(k(BUDGET_BASE, uid));
  if (!raw) return defaultBudget(lang);
  try {
    const parsed = JSON.parse(raw) as Partial<Budget>;
    return {
      min: typeof parsed.min === 'number' ? parsed.min : null,
      max: typeof parsed.max === 'number' ? parsed.max : null,
      currency: parsed.currency || (lang === 'tr' ? 'TRY' : 'USD'),
    };
  } catch {
    return defaultBudget(lang);
  }
}

export function saveBudget(b: Budget, uid?: string | null): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(k(BUDGET_BASE, uid), JSON.stringify(b));
}

export function budgetIsSet(b: Budget): boolean {
  return b.min !== null || b.max !== null;
}

type ParsedBudget = { min: number | null; max: number | null; currency: string | null };

function detectCurrency(msg: string, lang: Lang): string {
  if (/₺|\bTL\b|\btl\b|lira/i.test(msg)) return 'TRY';
  if (/€|\beur\b|euro/i.test(msg)) return 'EUR';
  if (/£|\bgbp\b|pound/i.test(msg)) return 'GBP';
  if (/\$|\busd\b|dollar/i.test(msg)) return 'USD';
  return lang === 'tr' ? 'TRY' : 'USD';
}

function num(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function parseBudgetFromMessage(message: string, lang: Lang): ParsedBudget | null {
  if (!message) return null;
  const msg = message.toLowerCase();
  const currency = detectCurrency(message, lang);
  const N = '([\\d.,]+\\s*k?)';

  const kNum = (s: string): number | null => {
    const v = num(s);
    if (v === null) return null;
    return /k/i.test(s) ? v * 1000 : v;
  };

  // Range: "1000-3000", "1000 ile 3000 arası", "between 100 and 200"
  const range =
    msg.match(new RegExp(`${N}\\s*[-–—]\\s*${N}`)) ||
    msg.match(new RegExp(`${N}\\s*(?:ile|to|and|ve)\\s*${N}\\s*(?:aras[ıi]|between)?`));
  if (range) {
    const a = kNum(range[1]);
    const b = kNum(range[2]);
    if (a !== null && b !== null) {
      return { min: Math.min(a, b), max: Math.max(a, b), currency };
    }
  }

  // Min only: "5000 ve üzeri", "5000 tl üzeri", "en az 5000", "5000+", "at least 100", "over 100", "min 100", "more than 100"
  const minMatch =
    msg.match(new RegExp(`${N}\\s*(?:\\+|ve\\s*[üu]zeri|[üu]zeri|ve\\s*[üu]st[üu]|ve\\s*[üu]st[üu]nde|ve\\s*fazlas[ıi]|den\\s*fazla|dan\\s*fazla)`)) ||
    msg.match(new RegExp(`(?:en\\s*az|min(?:imum)?|at\\s*least|over|more\\s*than)\\s*${N}`));
  if (minMatch) {
    const v = kNum(minMatch[1]);
    if (v !== null) return { min: v, max: null, currency };
  }

  // Max only: "5000 altında", "5000'in altında", "en fazla 5000", "max 5000", "under 200", "less than 200", "up to 200", "≤ 200"
  const maxMatch =
    msg.match(new RegExp(`${N}\\s*(?:'?[ıi]?n?\\s*)?(?:alt[ıi]nda|alt[ıi]|den\\s*az|dan\\s*az|ye?\\s*kadar)`)) ||
    msg.match(new RegExp(`(?:en\\s*fazla|en\\s*[çc]ok|max(?:imum)?|under|less\\s*than|up\\s*to|below|≤)\\s*${N}`));
  if (maxMatch) {
    const v = kNum(maxMatch[1]);
    if (v !== null) return { min: null, max: v, currency };
  }

  // Bare budget: "bütçem 2000", "budget 500", "yaklaşık 1000" → treat as max
  const bareBudget =
    msg.match(new RegExp(`(?:b[üu]t[çc]em|b[üu]t[çc]e|budget|yakla[şs][ıi]k|around|about)\\s*${N}`));
  if (bareBudget) {
    const v = kNum(bareBudget[1]);
    if (v !== null) return { min: null, max: v, currency };
  }

  return null;
}

export function mergeBudget(base: Budget, override: ParsedBudget | null): Budget {
  if (!override) return base;
  return {
    min: override.min ?? base.min,
    max: override.max ?? base.max,
    currency: override.currency ?? base.currency,
  };
}

export function formatBudget(b: Budget): string {
  if (!budgetIsSet(b)) return '∞';
  const sym = b.currency === 'TRY' ? '₺' : b.currency === 'EUR' ? '€' : b.currency === 'GBP' ? '£' : '$';
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`);
  if (b.min !== null && b.max !== null) return `${sym}${fmt(b.min)}–${fmt(b.max)}`;
  if (b.max !== null) return `≤ ${sym}${fmt(b.max)}`;
  return `≥ ${sym}${fmt(b.min!)}`;
}
