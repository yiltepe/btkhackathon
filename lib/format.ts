export function formatPrice(price: number | null, currency = 'EUR'): string {
  if (price === null) return '—';
  const sym = currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€';
  const rounded = price >= 100 ? Math.round(price) : price;
  return `${sym}${rounded.toLocaleString('en-US', { maximumFractionDigits: price < 100 ? 2 : 0 })}`;
}
