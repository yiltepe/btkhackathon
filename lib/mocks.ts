import type { Mode, Lang, Product, StandardResponse } from './types';

const RETAILERS_EN: Product[] = [
  { name: 'Common Projects · Achilles Low', price: 189, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://mrporter.com', retailer: 'Mr Porter' },
  { name: 'Common Projects · Achilles Low', price: 195, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://ssense.com', retailer: 'SSENSE' },
  { name: 'Common Projects · Achilles Low', price: 210, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://matchesfashion.com', retailer: 'Matches' },
  { name: 'Common Projects · Achilles Low', price: 215, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://endclothing.com', retailer: 'End Clothing' },
  { name: 'Common Projects · Achilles Low', price: 229, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://farfetch.com', retailer: 'Farfetch' },
  { name: 'Common Projects · Achilles Low', price: 245, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://commonprojects.com', retailer: 'Brand direct' },
];

const RETAILERS_TR: Product[] = [
  { name: 'Sneaker · Deri Beyaz', price: 3490, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://trendyol.com', retailer: 'Trendyol' },
  { name: 'Sneaker · Deri Beyaz', price: 3650, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://hepsiburada.com', retailer: 'Hepsiburada' },
  { name: 'Sneaker · Deri Beyaz', price: 3790, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://n11.com', retailer: 'N11' },
  { name: 'Sneaker · Deri Beyaz', price: 3990, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://amazon.com.tr', retailer: 'Amazon TR' },
  { name: 'Sneaker · Deri Beyaz', price: 4150, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://boyner.com.tr', retailer: 'Boyner' },
  { name: 'Sneaker · Deri Beyaz', price: 4290, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', link: 'https://morhipo.com', retailer: 'Morhipo' },
];

const FASHION_ITEMS_EN: Product[] = [
  { name: 'Stone trench coat', price: 175, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80', link: 'https://cos.com', retailer: 'COS' },
  { name: 'White poplin shirt', price: 69, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e32f1b7fc?w=400&q=80', link: 'https://arket.com', retailer: 'Arket' },
  { name: 'Black wool trouser', price: 129, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80', link: 'https://massimodutti.com', retailer: 'Massimo Dutti' },
  { name: 'Camel cashmere knit', price: 99, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80', link: 'https://uniqlo.com', retailer: 'Uniqlo C' },
  { name: 'Leather tote, cognac', price: 430, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', link: 'https://polene-paris.com', retailer: 'Polène' },
  { name: 'Pumice silk scarf', price: 185, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80', link: 'https://toteme-studio.com', retailer: 'Toteme' },
];

const FASHION_ITEMS_TR: Product[] = [
  { name: 'Bej trençkot', price: 3490, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80', link: 'https://trendyol.com', retailer: 'Trendyol' },
  { name: 'Beyaz poplin gömlek', price: 890, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e32f1b7fc?w=400&q=80', link: 'https://lcw.com', retailer: 'LC Waikiki' },
  { name: 'Siyah yün pantolon', price: 1290, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80', link: 'https://network.com.tr', retailer: 'Network' },
  { name: 'Deve tüyü triko', price: 1190, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80', link: 'https://koton.com', retailer: 'Koton' },
  { name: 'Konyak deri çanta', price: 4250, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', link: 'https://derimod.com.tr', retailer: 'Derimod' },
  { name: 'İpek fular', price: 1850, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80', link: 'https://vakko.com', retailer: 'Vakko' },
];

const HOME_ITEMS_EN: Product[] = [
  { name: 'Walnut lounge chair', price: 1450, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80', link: 'https://sibast-mobler.com', retailer: 'Sibast Møbler' },
  { name: 'Linen sofa, oat', price: 2890, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', link: 'https://sohohome.com', retailer: 'Soho Home' },
  { name: 'Travertine side table', price: 680, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1532372320978-9b4d08da3fbc?w=400&q=80', link: 'https://audocph.com', retailer: 'Audo' },
  { name: 'Paper floor lamp', price: 240, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80', link: 'https://hay.dk', retailer: 'Hay' },
  { name: 'Hand-knotted rug 2x3m', price: 1200, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=400&q=80', link: 'https://benirugs.com', retailer: 'Beni' },
  { name: 'Stoneware vase', price: 145, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=80', link: 'https://framacph.com', retailer: 'Frama' },
];

const HOME_ITEMS_TR: Product[] = [
  { name: 'Ceviz koltuk', price: 24500, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80', link: 'https://ikea.com.tr', retailer: 'IKEA' },
  { name: 'Keten kanepe', price: 38900, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', link: 'https://kelebek.com.tr', retailer: 'Kelebek' },
  { name: 'Mermer sehpa', price: 12900, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1532372320978-9b4d08da3fbc?w=400&q=80', link: 'https://english-home.com', retailer: 'English Home' },
  { name: 'Kâğıt abajur', price: 1990, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80', link: 'https://madameCoco.com', retailer: 'Madame Coco' },
  { name: 'El dokuma kilim', price: 14500, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=400&q=80', link: 'https://armaggan.com', retailer: 'Armaggan' },
  { name: 'Seramik vazo', price: 890, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=80', link: 'https://karaca.com', retailer: 'Karaca' },
];

const ELECTRONICS_ITEMS_EN: Product[] = [
  { name: 'iPhone 15 Pro · 256GB', price: 1199, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', link: 'https://apple.com', retailer: 'Apple' },
  { name: 'iPhone 15 Pro · 256GB', price: 1229, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', link: 'https://amazon.de', retailer: 'Amazon DE' },
  { name: 'iPhone 15 Pro · 256GB', price: 1249, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', link: 'https://mediamarkt.de', retailer: 'MediaMarkt' },
  { name: 'iPhone 15 Pro · 256GB', price: 1279, currency: 'EUR', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', link: 'https://saturn.de', retailer: 'Saturn' },
];

const ELECTRONICS_ITEMS_TR: Product[] = [
  { name: 'iPhone 15 · 128GB', price: 58999, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', link: 'https://trendyol.com', retailer: 'Trendyol' },
  { name: 'iPhone 15 · 128GB', price: 59499, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', link: 'https://hepsiburada.com', retailer: 'Hepsiburada' },
  { name: 'iPhone 15 · 128GB', price: 59999, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', link: 'https://vatanbilgisayar.com', retailer: 'Vatan' },
  { name: 'iPhone 15 · 128GB', price: 60499, currency: 'TRY', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', link: 'https://mediamarkt.com.tr', retailer: 'MediaMarkt TR' },
];

export function mockProducts(mode: Mode, lang: Lang): Product[] {
  if (mode === 'fashion') return lang === 'tr' ? FASHION_ITEMS_TR : FASHION_ITEMS_EN;
  if (mode === 'home') return lang === 'tr' ? HOME_ITEMS_TR : HOME_ITEMS_EN;
  if (mode === 'electronics') return lang === 'tr' ? ELECTRONICS_ITEMS_TR : ELECTRONICS_ITEMS_EN;
  return lang === 'tr' ? RETAILERS_TR : RETAILERS_EN;
}

export function mockResponse(mode: Mode, lang: Lang, message: string): StandardResponse {
  const resolved: Mode = mode === 'auto' ? inferMode(message) : mode;

  if (resolved === 'fashion') {
    return {
      mode: 'fashion',
      text: lang === 'tr'
        ? 'Bej bir trençkot etrafında — nötr, rahat, sıcak bir aksanla. Altı parçalık bir öneri.'
        : 'Built around a stone trench coat — neutral, off-duty, with one warm accent. Here\'s a six-piece take.',
      identifiedItem: { name: lang === 'tr' ? 'Bej trençkot' : 'Stone trench coat', type: 'coat', style: 'minimalist' },
      suggestions: mockProducts('fashion', lang).map(p => ({ name: p.name, searchQuery: p.name })),
      hasVisual: true,
      imagePrompt: 'Minimalist white background flat lay fashion photo. Styled outfit including: stone trench coat, white poplin shirt, black wool trouser, camel cashmere knit, cognac leather tote, silk scarf. Editorial, no text.',
      retailers: mockProducts('fashion', lang),
    };
  }
  if (resolved === 'home') {
    return {
      mode: 'home',
      text: lang === 'tr'
        ? 'Sakin bir okuma köşesi — sıcak ahşap ve bir terrakota dokunuş. 12–14 m² oda için.'
        : 'A quiet reading nook with warm wood and one terracotta moment. Sized for a 12–14 m² room.',
      identifiedItem: { name: lang === 'tr' ? 'Okuma köşesi' : 'Reading nook', type: 'room', style: 'minimalist' },
      suggestions: mockProducts('home', lang).map(p => ({ name: p.name, searchQuery: p.name })),
      hasVisual: true,
      imagePrompt: 'Interior design concept render. Cozy well-lit reading nook featuring: walnut chair, linen sofa, travertine side table, paper floor lamp, hand-knotted rug, stoneware vase, terracotta cushion. Editorial, no text.',
      retailers: mockProducts('home', lang),
    };
  }
  return {
    mode: resolved,
    text: lang === 'tr'
      ? 'Bu modeli altı satıcıda buldum. En uygunu — sevkiyat ücretsiz.'
      : 'Found this exact model at six retailers. Cheapest is Mr Porter — €189 with free 3-day shipping.',
    identifiedItem: { name: lang === 'tr' ? 'Sneaker' : 'Common Projects Achilles Low', type: 'sneaker' },
    hasVisual: false,
    retailers: mockProducts(resolved, lang),
  };
}

export function inferMode(text: string): Mode {
  const t = text.toLowerCase();
  if (/(price|cheaper|cheapest|discount|deal|compare|ucuz|indirim|fiyat|karşılaştır)/.test(t)) return 'price';
  if (/(outfit|look|wear|style|trouser|shirt|dress|coat|jacket|shoe|sneaker|bag|kombin|kıyafet|ceket|gömlek|elbise|ayakkabı|çanta)/.test(t)) return 'fashion';
  if (/(room|sofa|chair|lamp|rug|home|decor|living|kitchen|bedroom|oda|kanepe|koltuk|lamba|halı|ev|dekor|salon|mutfak|yatak)/.test(t)) return 'home';
  if (/(headphone|laptop|phone|tv|speaker|camera|watch|electronic|kulaklık|telefon|televizyon|kamera|saat)/.test(t)) return 'electronics';
  if (/(skincare|cream|serum|makeup|lipstick|fragrance|beauty|krem|serum|makyaj|ruj|parfüm|kozmetik)/.test(t)) return 'beauty';
  return 'price';
}
