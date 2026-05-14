export async function compressImage(file: File, maxEdge = 1024, quality = 0.85): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode_failed'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxEdge || height > maxEdge) {
          if (width >= height) {
            height = Math.round((height * maxEdge) / width);
            width = maxEdge;
          } else {
            width = Math.round((width * maxEdge) / height);
            height = maxEdge;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('no_ctx'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1] ?? '';
        resolve({ base64, mimeType: 'image/jpeg' });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const URL_RE = /^https?:\/\/[^\s]+$/i;
export function isUrl(text: string): boolean {
  return URL_RE.test(text.trim());
}

const URL_EXTRACT_RE = /https?:\/\/[^\s]+/i;
export function extractUrl(text: string): string | null {
  const match = text.match(URL_EXTRACT_RE);
  if (!match) return null;
  return match[0].replace(/[),.;!?]+$/, '');
}
