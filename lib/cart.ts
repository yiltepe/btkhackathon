import type { CartItem } from './types';

const KEY = 'oben:cart';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(items: CartItem[], item: CartItem): CartItem[] {
  if (items.some(i => i.id === item.id)) return items;
  return [...items, item];
}

export function removeFromCart(items: CartItem[], id: string): CartItem[] {
  return items.filter(i => i.id !== id);
}
