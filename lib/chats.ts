import type { Chat, Message, Lang } from './types';

const BASE = 'oben:chats';
const CAP = 20;

function key(uid?: string | null): string {
  return uid ? `${BASE}:${uid}` : BASE;
}

export function loadChats(uid?: string | null): Chat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key(uid));
    return raw ? (JSON.parse(raw) as Chat[]) : [];
  } catch {
    return [];
  }
}

export function saveChats(chats: Chat[], uid?: string | null): void {
  if (typeof window === 'undefined') return;
  const capped = chats.slice(0, CAP);
  window.localStorage.setItem(key(uid), JSON.stringify(capped));
}

export function makeChat(firstMessage: Message, lang: Lang): Chat {
  const title = firstMessage.text.slice(0, 40).trim() || 'New chat';
  return {
    id: 'c' + Date.now().toString(36),
    title,
    messages: [firstMessage],
    createdAt: Date.now(),
    lang,
  };
}

export function upsertChat(chats: Chat[], chat: Chat): Chat[] {
  const filtered = chats.filter(c => c.id !== chat.id);
  return [chat, ...filtered].slice(0, CAP);
}

export function deleteChat(chats: Chat[], id: string): Chat[] {
  return chats.filter(c => c.id !== id);
}
