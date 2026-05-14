import type { Budget, Gender, Lang } from './types';

export const GENDER_KEY = 'oben:gender';
export const BUDGET_KEY = 'oben:budget';

export function loadGender(): Gender | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(GENDER_KEY);
  return v === 'men' || v === 'women' || v === 'unisex' ? v : null;
}

export function saveGender(g: Gender): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GENDER_KEY, g);
}

export function defaultBudget(lang: Lang): Budget {
  return { min: null, max: null, currency: lang === 'tr' ? 'TRY' : 'USD' };
}

export function loadBudget(lang: Lang): Budget {
  if (typeof window === 'undefined') return defaultBudget(lang);
  const raw = window.localStorage.getItem(BUDGET_KEY);
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

export function saveBudget(b: Budget): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BUDGET_KEY, JSON.stringify(b));
}

export function budgetIsSet(b: Budget): boolean {
  return b.min !== null || b.max !== null;
}

export function formatBudget(b: Budget): string {
  if (!budgetIsSet(b)) return '∞';
  const sym = b.currency === 'TRY' ? '₺' : b.currency === 'EUR' ? '€' : b.currency === 'GBP' ? '£' : '$';
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`);
  if (b.min !== null && b.max !== null) return `${sym}${fmt(b.min)}–${fmt(b.max)}`;
  if (b.max !== null) return `≤ ${sym}${fmt(b.max)}`;
  return `≥ ${sym}${fmt(b.min!)}`;
}
