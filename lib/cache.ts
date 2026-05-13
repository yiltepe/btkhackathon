const PREFIX = 'oben:imagen-cache:';
const INDEX_KEY = 'oben:imagen-cache:index';
const CAP = 8;

export async function sha1(text: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(16);
  }
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-1', buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function readIndex(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(INDEX_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

function writeIndex(idx: string[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
}

export function getCached(hash: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PREFIX + hash);
}

export function setCached(hash: string, base64: string): void {
  if (typeof window === 'undefined') return;
  let idx = readIndex().filter(h => h !== hash);
  idx.unshift(hash);
  while (idx.length > CAP) {
    const evict = idx.pop();
    if (evict) window.localStorage.removeItem(PREFIX + evict);
  }
  try {
    window.localStorage.setItem(PREFIX + hash, base64);
    writeIndex(idx);
  } catch {
    // quota exceeded; evict more
    while (idx.length > 1) {
      const evict = idx.pop();
      if (evict) window.localStorage.removeItem(PREFIX + evict);
      try {
        window.localStorage.setItem(PREFIX + hash, base64);
        writeIndex(idx);
        return;
      } catch { /* keep trying */ }
    }
  }
}
