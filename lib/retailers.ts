// Known reputable retailer names / domain fragments.
// Matched case-insensitively against Product.retailer and the link hostname.
const TRUSTED: string[] = [
  // TR
  'trendyol', 'hepsiburada', 'n11', 'amazon', 'boyner', 'morhipo',
  'lcwaikiki', 'lcw', 'koton', 'defacto', 'mango', 'zara', 'vakko',
  'derimod', 'bershka', 'pullandbear', 'mediamarkt', 'teknosa', 'vatan',
  'gittigidiyor', 'ciceksepeti', 'englishhome', 'karaca', 'madamecoco',
  'kelebek', 'ikea', 'network', 'ipekyol', 'lacoste', 'nike', 'adidas',
  'puma', 'sephora', 'watsons', 'gratis', 'marks', 'armaggan', 'collezione',
  // EN / global
  'ebay', 'walmart', 'target', 'bestbuy', 'apple', 'asos', 'mrporter',
  'ssense', 'farfetch', 'netaporter', 'endclothing', 'matchesfashion',
  'cos', 'arket', 'uniqlo', 'johnlewis', 'selfridges', 'nordstrom',
  'bloomingdale', 'macys', 'polene', 'toteme', 'hm',
];

export function isTrusted(retailer: string, link: string): boolean {
  const name = retailer.toLowerCase().replace(/[\s.\-_]/g, '');
  if (TRUSTED.some((t) => name.includes(t))) return true;
  try {
    const host = new URL(link).hostname.replace('www.', '').toLowerCase().replace(/[\-_.]/g, '');
    return TRUSTED.some((t) => host.includes(t));
  } catch {
    return false;
  }
}
