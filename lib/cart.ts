import type { CartItem } from './types';

const BASE = 'oben:cart';

function key(uid?: string | null): string {
  return uid ? `${BASE}:${uid}` : BASE;
}

export function loadCart(uid?: string | null): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key(uid));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[], uid?: string | null): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key(uid), JSON.stringify(items));
}

export function addToCart(items: CartItem[], item: CartItem): CartItem[] {
  if (items.some(i => i.id === item.id)) return items;
  return [...items, item];
}

export function removeFromCart(items: CartItem[], id: string): CartItem[] {
  return items.filter(i => i.id !== id);
}
