// ============================================================
// OBEN — demo data + product SVG illustrations (reused from
// landing aesthetic). Editorial line silhouettes, single color.
// ============================================================

// Reusable SVG renderer — returns a JSX <svg> for a product.
const Product = ({ kind, size = 56, bg }) => {
  const wrap = { width: size, height: size, background: bg || '#F4F1EA', borderRadius: 4, display:'grid', placeItems:'center', flex:'0 0 auto', border:'1px solid #EDEDEA', overflow:'hidden' };
  const ink = '#1F1B17';
  const tan = '#7B5E3F';

  const draw = {
    trenchCoat: (
      <svg viewBox="0 0 100 130" width="78%" height="78%">
        <path d="M50 8 C45 8 41 11 39 16 L20 26 L12 58 L22 62 L20 124 L80 124 L78 62 L88 58 L80 26 L61 16 C59 11 55 8 50 8 Z" fill="#A88860"/>
        <path d="M48 16 L48 124 M52 16 L52 124" stroke="#7B5E3F" strokeWidth="0.5"/>
        <rect x="46" y="60" width="8" height="2" fill="#7B5E3F"/>
      </svg>
    ),
    whiteShirt: (
      <svg viewBox="0 0 100 130" width="78%" height="78%">
        <path d="M50 6 C45 6 41 9 39 13 L22 22 L14 48 L26 54 L28 118 L72 118 L74 54 L86 48 L78 22 L61 13 C59 9 55 6 50 6 Z" fill="#FFFFFF" stroke="#C9C2B5" strokeWidth="0.8"/>
        <line x1="50" y1="14" x2="50" y2="118" stroke="#C9C2B5" strokeWidth="0.6"/>
      </svg>
    ),
    blackTrouser: (
      <svg viewBox="0 0 100 130" width="78%" height="78%">
        <path d="M36 10 H64 L66 26 L62 122 L52 122 L50 60 L48 122 L38 122 L34 26 Z" fill="#1A1714"/>
      </svg>
    ),
    knit: (
      <svg viewBox="0 0 100 130" width="78%" height="78%">
        <path d="M50 8 C44 8 40 11 38 16 L22 24 L14 54 L26 58 L28 118 L72 118 L74 58 L86 54 L78 24 L62 16 C60 11 56 8 50 8 Z" fill="#C5A584"/>
        <path d="M28 60 H72 M28 75 H72 M28 90 H72 M28 105 H72" stroke="#A78460" strokeWidth="0.4" strokeDasharray="1.5 1"/>
      </svg>
    ),
    boot: (
      <svg viewBox="0 0 100 80" width="78%" height="78%">
        <path d="M28 8 L58 8 L60 32 Q86 38 86 56 L86 68 L14 68 L14 56 Q14 46 28 42 Z" fill="#5C2018"/>
        <line x1="28" y1="14" x2="58" y2="14" stroke="#3E140F" strokeWidth="0.5"/>
        <rect x="14" y="64" width="72" height="4" fill="#1F1810"/>
      </svg>
    ),
    bag: (
      <svg viewBox="0 0 100 110" width="78%" height="78%">
        <path d="M30 26 Q30 14 50 14 Q70 14 70 26 L70 32" stroke="#3E2E18" strokeWidth="2.5" fill="none"/>
        <rect x="20" y="30" width="60" height="58" rx="3" fill="#7B5429"/>
        <rect x="20" y="30" width="60" height="8" fill="#5C3F1E"/>
        <circle cx="50" cy="60" r="3" fill="#3E2E18"/>
      </svg>
    ),
    scarf: (
      <svg viewBox="0 0 100 110" width="78%" height="78%">
        <path d="M20 18 L80 18 L78 60 Q70 80 50 82 Q30 80 22 60 Z" fill="#5C2018"/>
        <path d="M28 30 L72 30 M28 42 L72 42 M28 54 L72 54" stroke="#E8DCC2" strokeWidth="0.4" strokeDasharray="3 2"/>
      </svg>
    ),
    sneaker: (
      <svg viewBox="0 0 100 80" width="78%" height="78%">
        <path d="M14 56 Q14 46 22 44 L40 40 Q44 32 56 32 Q72 32 80 46 Q86 50 86 58 L86 66 L14 66 Z" fill="#F4F1EA" stroke="#C8BD9F" strokeWidth="0.5"/>
        <path d="M40 40 L44 58 M50 36 L54 58 M60 36 L64 58" stroke="#C8BD9F" strokeWidth="0.6"/>
        <rect x="14" y="62" width="72" height="4" fill="#7A6E55"/>
      </svg>
    ),
    headphones: (
      <svg viewBox="0 0 100 100" width="78%" height="78%">
        <path d="M20 60 Q20 18 50 18 Q80 18 80 60" stroke="#1A1714" strokeWidth="4" fill="none"/>
        <rect x="14" y="56" width="14" height="32" rx="6" fill="#1A1714"/>
        <rect x="72" y="56" width="14" height="32" rx="6" fill="#1A1714"/>
        <rect x="16" y="60" width="10" height="24" rx="4" fill="#C9A268" opacity=".6"/>
        <rect x="74" y="60" width="10" height="24" rx="4" fill="#C9A268" opacity=".6"/>
      </svg>
    ),
    sofa: (
      <svg viewBox="0 0 100 80" width="80%" height="80%">
        <path d="M10 30 Q10 22 18 22 H82 Q90 22 90 30 V58 H10 Z" fill="#A88860"/>
        <rect x="14" y="34" width="22" height="20" rx="3" fill="#C8A981"/>
        <rect x="39" y="34" width="22" height="20" rx="3" fill="#C8A981"/>
        <rect x="64" y="34" width="22" height="20" rx="3" fill="#C8A981"/>
        <line x1="14" y1="60" x2="14" y2="68" stroke="#5C3F1E" strokeWidth="2"/>
        <line x1="86" y1="60" x2="86" y2="68" stroke="#5C3F1E" strokeWidth="2"/>
      </svg>
    ),
    sofaDark: (
      <svg viewBox="0 0 100 80" width="80%" height="80%">
        <path d="M10 30 Q10 22 18 22 H82 Q90 22 90 30 V58 H10 Z" fill="#2C3826"/>
        <rect x="14" y="34" width="22" height="20" rx="3" fill="#3F4D38"/>
        <rect x="39" y="34" width="22" height="20" rx="3" fill="#3F4D38"/>
        <rect x="64" y="34" width="22" height="20" rx="3" fill="#3F4D38"/>
        <line x1="14" y1="60" x2="14" y2="68" stroke="#1B2417" strokeWidth="2"/>
        <line x1="86" y1="60" x2="86" y2="68" stroke="#1B2417" strokeWidth="2"/>
      </svg>
    ),
    lamp: (
      <svg viewBox="0 0 100 110" width="65%" height="80%">
        <path d="M28 14 L72 14 L62 46 L38 46 Z" fill="#E8DCC2" stroke="#B59E72" strokeWidth="0.6"/>
        <line x1="50" y1="46" x2="50" y2="98" stroke="#5A4A30" strokeWidth="1.4"/>
        <ellipse cx="50" cy="102" rx="22" ry="4" fill="#5A4A30"/>
      </svg>
    ),
    chair: (
      <svg viewBox="0 0 100 110" width="78%" height="78%">
        <path d="M22 22 Q22 12 32 12 H68 Q78 12 78 22 V62 H22 Z" fill="#8C6B3E"/>
        <rect x="22" y="62" width="56" height="10" fill="#6E5430"/>
        <line x1="26" y1="72" x2="26" y2="100" stroke="#3E2E18" strokeWidth="2"/>
        <line x1="74" y1="72" x2="74" y2="100" stroke="#3E2E18" strokeWidth="2"/>
        <line x1="30" y1="72" x2="30" y2="96" stroke="#3E2E18" strokeWidth="2"/>
        <line x1="70" y1="72" x2="70" y2="96" stroke="#3E2E18" strokeWidth="2"/>
      </svg>
    ),
    rug: (
      <svg viewBox="0 0 100 100" width="80%" height="80%">
        <rect x="10" y="20" width="80" height="60" fill="#5C2018" stroke="#3E140F" strokeWidth="0.6"/>
        <rect x="16" y="26" width="68" height="48" fill="none" stroke="#E8DCC2" strokeWidth="0.7"/>
        <rect x="28" y="36" width="44" height="28" fill="none" stroke="#E8DCC2" strokeWidth="0.5"/>
      </svg>
    ),
    vase: (
      <svg viewBox="0 0 100 110" width="60%" height="85%">
        <path d="M40 10 H60 L58 22 Q72 30 72 60 Q72 92 50 100 Q28 92 28 60 Q28 30 42 22 Z" fill="#C9A87C" stroke="#9E7D52" strokeWidth="0.6"/>
        <path d="M44 14 Q42 30 50 38 Q58 30 56 14" stroke="#8E6B3F" strokeWidth="0.6" fill="none"/>
      </svg>
    ),
    table: (
      <svg viewBox="0 0 100 110" width="80%" height="80%">
        <ellipse cx="50" cy="32" rx="38" ry="10" fill="#A37748"/>
        <path d="M12 32 V40 Q50 50 88 40 V32" fill="#7B5429"/>
        <line x1="22" y1="42" x2="20" y2="100" stroke="#3E2E18" strokeWidth="2"/>
        <line x1="78" y1="42" x2="80" y2="100" stroke="#3E2E18" strokeWidth="2"/>
        <line x1="50" y1="46" x2="50" y2="100" stroke="#3E2E18" strokeWidth="2"/>
      </svg>
    ),
    pillow: (
      <svg viewBox="0 0 100 80" width="80%" height="80%">
        <rect x="14" y="20" width="72" height="44" rx="6" fill="#7C2D12"/>
        <path d="M22 28 Q22 24 26 24 M78 28 Q78 24 74 24 M22 56 Q22 60 26 60 M78 56 Q78 60 74 60" stroke="#5A1F0C" strokeWidth="0.6" fill="none"/>
      </svg>
    ),
    artFrame: (
      <svg viewBox="0 0 100 110" width="78%" height="78%">
        <rect x="20" y="12" width="60" height="80" fill="#EFE7D6" stroke="#3E2E18" strokeWidth="2"/>
        <path d="M28 60 Q40 40 50 50 Q60 60 72 44" stroke="#7C2D12" strokeWidth="3" fill="none"/>
        <circle cx="42" cy="32" r="4" fill="#A88860"/>
      </svg>
    ),
    bowl: (
      <svg viewBox="0 0 100 80" width="78%" height="78%">
        <path d="M16 36 Q16 60 50 64 Q84 60 84 36 Z" fill="#C9A87C" stroke="#9E7D52" strokeWidth="0.6"/>
        <ellipse cx="50" cy="36" rx="34" ry="4" fill="#9E7D52"/>
      </svg>
    ),
    book: (
      <svg viewBox="0 0 100 80" width="78%" height="78%">
        <rect x="18" y="22" width="64" height="46" fill="#5C2018"/>
        <rect x="22" y="26" width="56" height="38" fill="#3E140F"/>
        <line x1="50" y1="22" x2="50" y2="68" stroke="#2A0D09" strokeWidth="0.6"/>
      </svg>
    ),
    // Hero product (the one being searched)
    runningShoe: (
      <svg viewBox="0 0 100 60" width="80%" height="80%">
        <path d="M8 46 Q8 36 18 34 L34 30 Q40 18 56 18 Q74 18 84 36 Q92 40 92 48 L92 54 L8 54 Z" fill="#FFFFFF" stroke="#1A1714" strokeWidth="1"/>
        <path d="M34 30 L38 48 M44 24 L48 48 M54 22 L58 48 M64 24 L68 48" stroke="#1A1714" strokeWidth="0.8"/>
        <path d="M70 34 Q78 38 84 40" stroke="#7C2D12" strokeWidth="2"/>
        <rect x="8" y="50" width="84" height="4" fill="#1A1714"/>
      </svg>
    ),
  };

  return (
    <div style={wrap}>
      {draw[kind] || <div style={{width:'60%',height:'60%',background:'#D8D5CE',borderRadius:3}}/>}
    </div>
  );
};

// ============================================================
// Retailer "logos" — simple wordmarks. Keep them low-key.
// ============================================================
const Retailer = ({ name, size = 14, color }) => (
  <span style={{
    fontSize: size, fontWeight: 500, letterSpacing:'.06em', textTransform:'uppercase',
    color: color || '#111', whiteSpace:'nowrap',
  }}>{name}</span>
);

// ============================================================
// Demo data
// ============================================================
const DEMO_CHATS = [
  { id:'c1', title:'Loafers under €300',    when:'Today'      },
  { id:'c2', title:'Linen shirt — same model', when:'Today'   },
  { id:'c3', title:'Mid-century reading nook', when:'Yesterday'},
  { id:'c4', title:'Wedding guest, navy palette', when:'Mon'  },
  { id:'c5', title:'Travel headphones, ANC', when:'Last week' },
  { id:'c6', title:'Cream for sensitive skin', when:'Last week'},
  { id:'c7', title:'Brown leather satchel', when:'May 2'      },
];

const SUGGEST_PROMPTS = [
  { mode:'price',       label:'Find this cheaper',           example:'Paste any product link →' },
  { mode:'fashion',     label:'Style this jacket',           example:'Build a full look around it' },
  { mode:'home',        label:'Furnish my living room',      example:'Around a walnut coffee table' },
  { mode:'electronics', label:'Compare to alternatives',     example:'Sony WH-1000XM5 vs. peers' },
];

// PRICE COMPARE — retailers (sorted cheapest first by default)
const PRICE_RETAILERS = [
  { id:'r1', name:'Mr Porter',   price: 189.00, ship:'Free, 3 days',  rating:4.8 },
  { id:'r2', name:'SSENSE',      price: 195.00, ship:'Free, 5 days',  rating:4.6 },
  { id:'r3', name:'Matches',     price: 210.00, ship:'€12, 2 days',   rating:4.5 },
  { id:'r4', name:'End Clothing',price: 215.00, ship:'Free, 4 days',  rating:4.7 },
  { id:'r5', name:'Farfetch',    price: 229.00, ship:'€8, 3 days',    rating:4.4 },
  { id:'r6', name:'Brand direct',price: 245.00, ship:'Free, 2 days',  rating:4.9 },
];

// Hero product context (referenced by Price modal too)
const HERO_PRODUCT = {
  name:'Common Projects · Achilles Low Sneaker',
  variant:'Bone, sz 42',
  asset:'sneaker',
};

// FASHION look
const FASHION_LOOK = {
  desc: 'A neutral, off-duty palette built around the cream sneaker — relaxed but considered.',
  items: [
    { id:'f1', name:'Stone trench coat',        retailer:'COS',         price:175, asset:'trenchCoat' },
    { id:'f2', name:'White poplin shirt',       retailer:'Arket',       price:69,  asset:'whiteShirt' },
    { id:'f3', name:'Black wool trouser',       retailer:'Massimo Dutti',price:129, asset:'blackTrouser' },
    { id:'f4', name:'Camel cashmere knit',      retailer:'Uniqlo C',    price:99,  asset:'knit' },
    { id:'f5', name:'Leather tote, cognac',     retailer:'Polène',      price:430, asset:'bag' },
    { id:'f6', name:'Pumice silk scarf',        retailer:'Toteme',      price:185, asset:'scarf' },
  ],
};

// HOME look
const HOME_LOOK = {
  desc: 'A calm reading corner — warm woods, terracotta accents, low light.',
  items: [
    { id:'h1', name:'Walnut lounge chair',     retailer:'Sibast Møbler',price:1450, asset:'chair' },
    { id:'h2', name:'Linen sofa, oat',         retailer:'Soho Home',    price:2890, asset:'sofa'  },
    { id:'h3', name:'Travertine side table',   retailer:'Audo',         price:680,  asset:'table' },
    { id:'h4', name:'Paper floor lamp',        retailer:'Hay',          price:240,  asset:'lamp'  },
    { id:'h5', name:'Hand-knotted rug 2x3m',   retailer:'Beni',         price:1200, asset:'rug'   },
    { id:'h6', name:'Stoneware vase',          retailer:'Frama',        price:145,  asset:'vase'  },
    { id:'h7', name:'Terracotta cushion',      retailer:'Tekla',        price:90,   asset:'pillow'},
  ],
};

const INITIAL_CART = [
  { id:'cart1', name:'Common Projects · Achilles Low', retailer:'Mr Porter', price:189, asset:'sneaker' },
  { id:'cart2', name:'Camel cashmere knit',            retailer:'Uniqlo C',  price:99,  asset:'knit'    },
  { id:'cart3', name:'Paper floor lamp',               retailer:'Hay',       price:240, asset:'lamp'    },
];

const MODES = [
  { id:'auto',        label:'Auto'        },
  { id:'price',       label:'Price'       },
  { id:'fashion',     label:'Fashion'     },
  { id:'home',        label:'Home'        },
  { id:'electronics', label:'Electronics' },
  { id:'beauty',      label:'Beauty'      },
];

Object.assign(window, {
  Product, Retailer,
  DEMO_CHATS, SUGGEST_PROMPTS, PRICE_RETAILERS,
  HERO_PRODUCT, FASHION_LOOK, HOME_LOOK, INITIAL_CART, MODES,
});
