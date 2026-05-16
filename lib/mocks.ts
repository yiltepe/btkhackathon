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

export function mockComparison(lang: Lang): StandardResponse {
  if (lang === 'tr') {
    return {
      mode: 'price',
      text: 'Oyun için Sony — düşük gecikme ve net mikrofon onu daha güvenli seçim yapıyor.',
      hasVisual: false,
      comparison: {
        items: [
          { name: 'Sony WH-1000XM5', sourceIndex: 0, summary: 'Daha düşük Bluetooth gecikmesi ve daha net mikrofon.', pros: ['Düşük gecikmeli codec\'ler', 'Net mikrofon'], cons: ['Bose\'a göre daha az pasif yalıtım'], bestFor: 'oyun ve sesli sohbet' },
          { name: 'Bose QuietComfort Ultra', sourceIndex: 1, summary: 'Sınıfının en iyi pasif yalıtımı ama daha yüksek kablosuz gecikme.', pros: ['En sıkı yalıtım'], cons: ['Yüksek Bluetooth gecikmesi'], bestFor: 'uçuş ve ofis' },
        ],
        winner: 'Sony WH-1000XM5',
        verdict: 'Oyun için Sony WH-1000XM5 — düşük gecikme ve iyi mikrofon onu daha güvenli seçim yapıyor.',
      },
    };
  }
  return {
    mode: 'price',
    text: 'Sony for gaming — lower latency and a better mic make it the safer pick.',
    hasVisual: false,
    comparison: {
      items: [
        { name: 'Sony WH-1000XM5', sourceIndex: 0, summary: 'Lower-latency Bluetooth and clearer mic.', pros: ['Low-latency codecs', 'Clear mic for voice chat'], cons: ['Less passive isolation than Bose'], bestFor: 'gaming and voice chat' },
        { name: 'Bose QuietComfort Ultra', sourceIndex: 1, summary: 'Best-in-class passive isolation but more wireless lag.', pros: ['Tightest seal and isolation'], cons: ['Higher Bluetooth latency'], bestFor: 'flights and offices' },
      ],
      winner: 'Sony WH-1000XM5',
      verdict: 'Sony WH-1000XM5 for gaming — lower latency and a better mic make it the safer pick.',
    },
  };
}

export function mockResponse(mode: Mode, lang: Lang, message: string): StandardResponse {
  const resolved: Mode = mode === 'auto' ? inferMode(message) : mode;

  if (resolved === 'fashion') {
    const slots = ['outerwear', 'top', 'bottom', 'top', 'bag', 'accessory'];
    return {
      mode: 'fashion',
      text: lang === 'tr'
        ? 'Bej bir trençkot etrafında — nötr, rahat, sıcak bir aksanla. Altı parçalık bir öneri.'
        : 'Built around a stone trench coat — neutral, off-duty, with one warm accent. Here\'s a six-piece take.',
      identifiedItem: { name: lang === 'tr' ? 'Bej trençkot' : 'Stone trench coat', type: 'coat', style: 'minimalist' },
      suggestions: mockProducts('fashion', lang).map((p, i) => ({ name: p.name, searchQuery: p.name, swapSlot: slots[i] || 'accessory' })),
      hasVisual: true,
      imagePrompt: 'Minimalist white background flat lay fashion photo. Styled outfit including: stone trench coat, white poplin shirt, black wool trouser, camel cashmere knit, cognac leather tote, silk scarf. Editorial, no text.',
      retailers: mockProducts('fashion', lang),
      prefsSummary: lang === 'tr' ? 'minimalist nötr, sıcak aksan, kadın günlük' : 'minimalist neutrals, warm accent, womens off-duty',
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
    verdict: lang === 'tr'
      ? 'Mr Porter ücretsiz kargo + en düşük fiyat — bu hafta açık ara en iyi alım.'
      : 'Mr Porter — free shipping plus the lowest price makes this the clear pick this week.',
    reviewSummary: {
      rating: 4.6,
      sampleSize: 318,
      pros: lang === 'tr'
        ? ['Premium deri kalitesi', 'Yıllar boyunca eskimeyen siluet']
        : ['Premium leather quality', 'Silhouette ages well'],
      cons: lang === 'tr' ? ['Tabanı sert geliyor'] : ['Sole runs firm'],
    },
  };
}

export function mockDupeFinder(lang: Lang): StandardResponse {
  return {
    mode: 'price',
    text: lang === 'tr'
      ? 'Aynı sade siluetin daha hesaplı 3 muadili — derinin yerini kanvas/tekstil alıyor, fiyat üçte birine kadar düşüyor.'
      : 'Three cheaper look-alikes — canvas/textile in place of leather, down to roughly a third of the price.',
    identifiedItem: { name: lang === 'tr' ? 'Beyaz minimal sneaker' : 'White minimal sneaker', type: 'sneaker' },
    hasVisual: false,
    suggestions: [
      {
        name: lang === 'tr' ? 'Beyaz kanvas low-top' : 'White canvas low-top',
        searchQuery: lang === 'tr' ? 'beyaz kanvas low-top sneaker' : 'white canvas low-top sneaker',
        reason: lang === 'tr' ? 'aynı sade siluet, kanvas — ~%60 daha uygun' : 'same clean silhouette, canvas — ~60% cheaper',
        dupeOf: 0,
      },
      {
        name: lang === 'tr' ? 'Beyaz mikrofiber sneaker' : 'White microfiber sneaker',
        searchQuery: lang === 'tr' ? 'beyaz mikrofiber sneaker' : 'white microfiber sneaker',
        reason: lang === 'tr' ? 'deri görünümü, vegan, ~%40 daha uygun' : 'leather look, vegan, ~40% cheaper',
        dupeOf: 0,
      },
      {
        name: lang === 'tr' ? 'Beyaz tekstil retro sneaker' : 'White textile retro sneaker',
        searchQuery: lang === 'tr' ? 'beyaz retro sneaker tekstil' : 'white retro textile sneaker',
        reason: lang === 'tr' ? 'biraz daha sportif ama benzer ton' : 'slightly sportier but same tonal palette',
        dupeOf: 0,
      },
    ],
    verdict: lang === 'tr'
      ? 'Hızlı eskimeyen bir görünüm istiyorsan kanvas low-top — fiyat/performans en yüksek.'
      : 'Go canvas low-top — best value if you want the look without leather upkeep.',
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
