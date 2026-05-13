import React from 'react';

type Kind = 'hanger' | 'square';
export type VitrineItem = {
  id: string;
  kind: Kind;
  tag: string;
  price: string;
  body: React.ReactNode;
  vw?: number;
  vh?: number;
};

const S = (props: React.SVGProps<SVGSVGElement> & { vw?: number; vh?: number }, inner: React.ReactNode) => (
  <svg viewBox={`0 0 ${props.vw ?? 100} ${props.vh ?? 130}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    {inner}
  </svg>
);

export const ITEMS: VitrineItem[] = [
  // FASHION (hanger)
  { id: 'knit1', kind: 'hanger', tag: 'KNIT', price: '€189', body: S({}, (
    <>
      <path d="M50 8 C42 8 38 12 36 18 L20 28 L14 60 L24 62 L26 118 L74 118 L76 62 L86 60 L80 28 L64 18 C62 12 58 8 50 8 Z" fill="#3A322B" />
    </>
  )) },
  { id: 'shirt1', kind: 'hanger', tag: 'SHIRT', price: '€95', body: S({}, (
    <>
      <path d="M50 6 C45 6 41 9 39 13 L22 22 L14 48 L26 54 L28 118 L72 118 L74 54 L86 48 L78 22 L61 13 C59 9 55 6 50 6 Z" fill="#E8E4DC" stroke="#C9C2B5" strokeWidth="0.6" />
      <line x1="50" y1="14" x2="50" y2="118" stroke="#C9C2B5" strokeWidth="0.5" />
    </>
  )) },
  { id: 'coat', kind: 'hanger', tag: 'COAT', price: '€420', body: S({}, (
    <>
      <path d="M50 6 C45 6 41 9 39 14 L20 24 L12 56 L22 60 L20 122 L80 122 L78 60 L88 56 L80 24 L61 14 C59 9 55 6 50 6 Z" fill="#7B5E3F" />
      <path d="M48 14 L48 122 M52 14 L52 122" stroke="#5E4528" strokeWidth="0.5" />
    </>
  )) },
  { id: 'dress', kind: 'hanger', tag: 'DRESS', price: '€245', body: S({}, (
    <path d="M50 8 C44 8 40 11 38 16 L26 22 L22 36 L34 38 L18 120 L82 120 L66 38 L78 36 L74 22 L62 16 C60 11 56 8 50 8 Z" fill="#1F2A26" />
  )) },
  { id: 'blazer', kind: 'hanger', tag: 'BLAZER', price: '€340', body: S({}, (
    <>
      <path d="M50 8 C44 8 40 11 38 16 L22 24 L14 54 L26 58 L28 118 L72 118 L74 58 L86 54 L78 24 L62 16 C60 11 56 8 50 8 Z" fill="#0D0D0D" />
      <path d="M50 16 L42 116 M50 16 L58 116" stroke="#2B2B2B" strokeWidth="0.5" />
    </>
  )) },
  { id: 'trouser', kind: 'hanger', tag: 'TROUSERS', price: '€175', body: S({}, (
    <path d="M36 10 H64 L66 26 L62 118 L52 118 L50 60 L48 118 L38 118 L34 26 Z" fill="#7A6E55" />
  )) },
  { id: 'knit2', kind: 'hanger', tag: 'KNIT', price: '€220', body: S({}, (
    <>
      <path d="M50 8 C44 8 40 11 38 16 L22 24 L14 54 L26 58 L28 116 L72 116 L74 58 L86 54 L78 24 L62 16 C60 11 56 8 50 8 Z" fill="#C5A584" />
      <path d="M28 60 H72 M28 75 H72 M28 90 H72 M28 105 H72" stroke="#A78460" strokeWidth="0.4" strokeDasharray="1.5 1" />
    </>
  )) },
  { id: 'shirt2', kind: 'hanger', tag: 'SHIRT', price: '€110', body: S({}, (
    <path d="M50 6 C45 6 41 9 39 13 L22 22 L14 48 L26 54 L28 118 L72 118 L74 54 L86 48 L78 22 L61 13 C59 9 55 6 50 6 Z" fill="#0F2540" stroke="#0A1B30" strokeWidth="0.4" />
  )) },
  { id: 'card', kind: 'hanger', tag: 'CARDIGAN', price: '€260', body: S({}, (
    <>
      <path d="M50 8 C44 8 40 11 38 16 L22 24 L14 54 L26 58 L28 118 L72 118 L74 58 L86 54 L78 24 L62 16 C60 11 56 8 50 8 Z" fill="#EFE7D6" stroke="#D2C8B0" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="1" fill="#A99C7A" />
      <circle cx="50" cy="72" r="1" fill="#A99C7A" />
      <circle cx="50" cy="94" r="1" fill="#A99C7A" />
    </>
  )) },
  { id: 'skirt', kind: 'hanger', tag: 'SKIRT', price: '€145', body: S({}, (
    <path d="M36 12 H64 L72 24 L84 118 L16 118 L28 24 Z" fill="#5C2018" />
  )) },
  { id: 'tee', kind: 'hanger', tag: 'TEE', price: '€55', body: S({}, (
    <path d="M50 10 C46 10 42 13 40 18 L22 26 L18 44 L30 48 L30 112 L70 112 L70 48 L82 44 L78 26 L60 18 C58 13 54 10 50 10 Z" fill="#F4F1EA" />
  )) },
  { id: 'jacket', kind: 'hanger', tag: 'JACKET', price: '€385', body: S({}, (
    <path d="M50 8 C44 8 40 11 38 16 L22 24 L14 54 L26 58 L28 118 L72 118 L74 58 L86 54 L78 24 L62 16 C60 11 56 8 50 8 Z" fill="#2C3826" />
  )) },
  // HOME (square)
  { id: 'lamp', kind: 'square', tag: 'LAMP', price: '€189', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <path d="M28 14 L72 14 L62 46 L38 46 Z" fill="#E8DCC2" stroke="#B59E72" strokeWidth="0.5" />
      <line x1="50" y1="46" x2="50" y2="98" stroke="#5A4A30" strokeWidth="1.2" />
      <ellipse cx="50" cy="102" rx="22" ry="4" fill="#5A4A30" />
    </>
  )) },
  { id: 'chair', kind: 'square', tag: 'CHAIR', price: '€520', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <path d="M22 22 Q22 12 32 12 H68 Q78 12 78 22 V62 H22 Z" fill="#8C6B3E" />
      <rect x="22" y="62" width="56" height="10" fill="#6E5430" />
      <line x1="26" y1="72" x2="26" y2="100" stroke="#3E2E18" strokeWidth="2" />
      <line x1="74" y1="72" x2="74" y2="100" stroke="#3E2E18" strokeWidth="2" />
    </>
  )) },
  { id: 'vase', kind: 'square', tag: 'VASE', price: '€78', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <path d="M40 10 H60 L58 22 Q72 30 72 60 Q72 92 50 100 Q28 92 28 60 Q28 30 42 22 Z" fill="#C9A87C" stroke="#9E7D52" strokeWidth="0.5" />
  )) },
  { id: 'rug', kind: 'square', tag: 'RUG', price: '€640', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="14" y="20" width="72" height="70" fill="#5C2018" stroke="#3E140F" strokeWidth="0.5" />
      <rect x="20" y="26" width="60" height="58" fill="none" stroke="#E8DCC2" strokeWidth="0.6" />
    </>
  )) },
  { id: 'table', kind: 'square', tag: 'TABLE', price: '€890', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <ellipse cx="50" cy="32" rx="38" ry="10" fill="#A37748" />
      <path d="M12 32 V40 Q50 50 88 40 V32" fill="#7B5429" />
      <line x1="22" y1="42" x2="20" y2="100" stroke="#3E2E18" strokeWidth="2" />
      <line x1="78" y1="42" x2="80" y2="100" stroke="#3E2E18" strokeWidth="2" />
      <line x1="50" y1="46" x2="50" y2="100" stroke="#3E2E18" strokeWidth="2" />
    </>
  )) },
  { id: 'mirror', kind: 'square', tag: 'MIRROR', price: '€310', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="34" y="10" width="32" height="90" rx="16" fill="#EFE7D6" stroke="#9E8B66" strokeWidth="1.2" />
      <rect x="38" y="14" width="24" height="82" rx="12" fill="#D9D2C2" />
    </>
  )) },
  // BEAUTY
  { id: 'lipstick', kind: 'square', tag: 'LIPSTICK', price: '€36', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="42" y="14" width="16" height="20" fill="#7C2D12" />
      <path d="M42 14 L50 6 L58 14 Z" fill="#9C3D20" />
      <rect x="38" y="34" width="24" height="36" fill="#1A1714" />
      <rect x="36" y="68" width="28" height="6" fill="#C9A268" />
      <rect x="38" y="74" width="24" height="22" fill="#1A1714" />
    </>
  )) },
  { id: 'serum', kind: 'square', tag: 'SERUM', price: '€68', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="38" y="10" width="24" height="8" fill="#1A1714" />
      <rect x="42" y="18" width="16" height="6" fill="#2D2620" />
      <rect x="34" y="24" width="32" height="70" rx="3" fill="#D9C8A8" />
    </>
  )) },
  { id: 'cream', kind: 'square', tag: 'CREAM', price: '€95', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="26" y="38" width="48" height="56" rx="2" fill="#EFE7D6" stroke="#C8BD9F" strokeWidth="0.5" />
      <rect x="26" y="38" width="48" height="14" fill="#1A1714" />
    </>
  )) },
  { id: 'fragrance', kind: 'square', tag: 'FRAGRANCE', price: '€140', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="44" y="8" width="12" height="14" fill="#1A1714" />
      <rect x="38" y="22" width="24" height="6" fill="#C9A268" />
      <path d="M30 28 H70 V96 Q70 100 66 100 H34 Q30 100 30 96 Z" fill="#F4E9CC" stroke="#B59E72" strokeWidth="0.4" />
    </>
  )) },
  // ELECTRONICS
  { id: 'headphones', kind: 'square', tag: 'HEADPHONES', price: '€420', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <path d="M20 60 Q20 18 50 18 Q80 18 80 60" stroke="#1A1714" strokeWidth="4" fill="none" />
      <rect x="14" y="56" width="14" height="32" rx="6" fill="#1A1714" />
      <rect x="72" y="56" width="14" height="32" rx="6" fill="#1A1714" />
    </>
  )) },
  { id: 'camera', kind: 'square', tag: 'CAMERA', price: '€1,240', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="14" y="34" width="72" height="48" rx="3" fill="#1A1714" />
      <rect x="36" y="28" width="28" height="8" fill="#1A1714" />
      <circle cx="50" cy="58" r="18" fill="#0A0908" stroke="#3E3530" strokeWidth="1.5" />
      <circle cx="50" cy="58" r="12" fill="#1A1714" />
    </>
  )) },
  { id: 'watch', kind: 'square', tag: 'WATCH', price: '€680', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="38" y="6" width="24" height="14" fill="#3E3530" />
      <rect x="38" y="84" width="24" height="20" fill="#3E3530" />
      <rect x="30" y="20" width="40" height="64" rx="8" fill="#1A1714" stroke="#5A4628" strokeWidth="1" />
      <rect x="34" y="26" width="32" height="50" rx="5" fill="#0A0908" />
    </>
  )) },
  { id: 'speaker', kind: 'square', tag: 'SPEAKER', price: '€295', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="28" y="12" width="44" height="88" rx="6" fill="#2D2620" />
      <circle cx="50" cy="32" r="9" fill="#0A0908" stroke="#5A4628" strokeWidth="0.6" />
      <circle cx="50" cy="60" r="15" fill="#0A0908" stroke="#5A4628" strokeWidth="0.6" />
    </>
  )) },
  // SHOES
  { id: 'loafer', kind: 'square', tag: 'LOAFER', price: '€330', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <path d="M14 60 Q14 50 24 48 L72 44 Q86 46 86 58 Q86 70 76 72 L24 72 Q14 72 14 60 Z" fill="#5C2018" />
  )) },
  { id: 'sneaker', kind: 'square', tag: 'SNEAKER', price: '€175', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <path d="M14 62 Q14 52 22 50 L40 46 Q44 38 56 38 Q72 38 80 52 Q86 56 86 64 L86 72 L14 72 Z" fill="#EFE7D6" stroke="#C8BD9F" strokeWidth="0.4" />
      <rect x="14" y="68" width="72" height="4" fill="#7A6E55" />
    </>
  )) },
  { id: 'boot', kind: 'square', tag: 'BOOT', price: '€590', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <path d="M30 14 L60 14 L62 40 Q86 46 86 60 L86 72 L14 72 L14 60 Q14 50 28 46 Z" fill="#3E2E18" />
      <rect x="14" y="68" width="72" height="4" fill="#1F1810" />
    </>
  )) },
  // ACCESSORIES
  { id: 'bag', kind: 'square', tag: 'BAG', price: '€695', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <path d="M30 26 Q30 14 50 14 Q70 14 70 26 L70 32" stroke="#3E2E18" strokeWidth="2.5" fill="none" />
      <rect x="20" y="30" width="60" height="58" rx="3" fill="#7B5429" />
    </>
  )) },
  { id: 'scarf', kind: 'square', tag: 'SCARF', price: '€220', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <path d="M20 18 L80 18 L78 60 Q70 80 50 82 Q30 80 22 60 Z" fill="#5C2018" />
  )) },
  { id: 'belt', kind: 'square', tag: 'BELT', price: '€140', vw: 100, vh: 110, body: S({ vw: 100, vh: 110 }, (
    <>
      <rect x="10" y="48" width="80" height="14" rx="2" fill="#3E2E18" />
      <rect x="58" y="44" width="20" height="22" fill="none" stroke="#C9A268" strokeWidth="1.5" />
    </>
  )) },
];
