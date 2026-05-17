import type { Budget, CartItem, Chat, Gender } from './types';

export type UserState = {
  chats: Chat[];
  cart: CartItem[];
  gender: Gender | null;
  budget: Budget | null;
  prefsSummary: string;
};

const EMPTY: UserState = { chats: [], cart: [], gender: null, budget: null, prefsSummary: '' };

export async function loadUserState(): Promise<UserState> {
  try {
    const r = await fetch('/api/state', { cache: 'no-store' });
    if (!r.ok) return EMPTY;
    const data = await r.json();
    return {
      chats: Array.isArray(data.chats) ? (data.chats as Chat[]) : [],
      cart: Array.isArray(data.cart) ? (data.cart as CartItem[]) : [],
      gender: data.gender === 'men' || data.gender === 'women' || data.gender === 'unisex' ? data.gender : null,
      budget: data.budget && typeof data.budget === 'object' ? (data.budget as Budget) : null,
      prefsSummary: typeof data.prefs_summary === 'string' ? data.prefs_summary : '',
    };
  } catch {
    return EMPTY;
  }
}

type PatchBody = Partial<{
  chats: Chat[];
  cart: CartItem[];
  gender: Gender | null;
  budget: Budget | null;
  prefsSummary: string;
}>;

export async function saveUserState(patch: PatchBody): Promise<void> {
  try {
    await fetch('/api/state', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
  } catch {
    // Silent — UI already updated optimistically.
  }
}
