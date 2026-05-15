import React from 'react';

type Kind = 'hanger' | 'square';
export type VitrineItem = {
  id: string;
  kind: Kind;
  tag: string;
  price: string;
  body: React.ReactNode;
};

const img = (src: string, alt: string) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    draggable={false}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      objectPosition: 'center',
      userSelect: 'none',
    }}
  />
);

export const ITEMS: VitrineItem[] = [
  { id: 'knit1',      kind: 'hanger', tag: 'KNIT',       price: '€189',   body: img('/vitrine/hanger/01.webp', 'Oatmeal knit sweater') },
  { id: 'shirt1',     kind: 'hanger', tag: 'SHIRT',      price: '€95',    body: img('/vitrine/hanger/02.webp', 'White poplin shirt') },
  { id: 'coat',       kind: 'hanger', tag: 'COAT',       price: '€420',   body: img('/vitrine/hanger/03.webp', 'Camel wool coat') },
  { id: 'dress',      kind: 'hanger', tag: 'DRESS',      price: '€245',   body: img('/vitrine/hanger/04.webp', 'Burgundy silk slip dress') },
  { id: 'blazer',     kind: 'hanger', tag: 'BLAZER',     price: '€340',   body: img('/vitrine/hanger/05.webp', 'Charcoal wool blazer') },
  { id: 'trouser',    kind: 'hanger', tag: 'TROUSERS',   price: '€175',   body: img('/vitrine/hanger/06.webp', 'Taupe pleated trousers') },
  { id: 'knit2',      kind: 'hanger', tag: 'KNIT',       price: '€220',   body: img('/vitrine/hanger/07.webp', 'Sand cashmere knit') },
  { id: 'shirt2',     kind: 'hanger', tag: 'SHIRT',      price: '€110',   body: img('/vitrine/hanger/08.webp', 'Ecru and rust striped shirt') },
  { id: 'card',       kind: 'hanger', tag: 'CARDIGAN',   price: '€260',   body: img('/vitrine/hanger/09.webp', 'Cream brushed cardigan') },
  { id: 'skirt',      kind: 'hanger', tag: 'SKIRT',      price: '€145',   body: img('/vitrine/hanger/10.webp', 'Espresso bias midi skirt') },
  { id: 'tee',        kind: 'hanger', tag: 'TEE',        price: '€55',    body: img('/vitrine/hanger/11.webp', 'Washed black cotton tee') },
  { id: 'jacket',     kind: 'hanger', tag: 'JACKET',     price: '€385',   body: img('/vitrine/hanger/12.webp', 'Terracotta suede jacket') },

  { id: 'lamp',       kind: 'square', tag: 'LAMP',       price: '€189',   body: img('/vitrine/square/01.webp', 'Alabaster table lamp') },
  { id: 'chair',      kind: 'square', tag: 'CHAIR',      price: '€520',   body: img('/vitrine/square/02.webp', 'Oak and bouclé lounge chair') },
  { id: 'vase',       kind: 'square', tag: 'VASE',       price: '€78',    body: img('/vitrine/square/03.webp', 'Sand ceramic vase') },
  { id: 'rug',        kind: 'square', tag: 'RUG',        price: '€640',   body: img('/vitrine/square/04.webp', 'Wool berber rug') },
  { id: 'table',      kind: 'square', tag: 'TABLE',      price: '€890',   body: img('/vitrine/square/05.webp', 'Travertine side table') },
  { id: 'mirror',     kind: 'square', tag: 'MIRROR',     price: '€310',   body: img('/vitrine/square/06.webp', 'Arched brass mirror') },
  { id: 'lipstick',   kind: 'square', tag: 'LIPSTICK',   price: '€36',    body: img('/vitrine/square/07.webp', 'Aluminum lipstick') },
  { id: 'serum',      kind: 'square', tag: 'SERUM',      price: '€68',    body: img('/vitrine/square/08.webp', 'Amber serum dropper') },
  { id: 'cream',      kind: 'square', tag: 'CREAM',      price: '€95',    body: img('/vitrine/square/09.webp', 'Frosted glass cream jar') },
  { id: 'fragrance',  kind: 'square', tag: 'FRAGRANCE',  price: '€140',   body: img('/vitrine/square/10.webp', 'Fragrance flacon') },
  { id: 'headphones', kind: 'square', tag: 'HEADPHONES', price: '€420',   body: img('/vitrine/square/11.webp', 'Matte black headphones') },
  { id: 'camera',     kind: 'square', tag: 'CAMERA',     price: '€1,240', body: img('/vitrine/square/12.webp', 'Mirrorless camera') },
  { id: 'watch',      kind: 'square', tag: 'WATCH',      price: '€680',   body: img('/vitrine/square/13.webp', 'Leather strap wristwatch') },
  { id: 'speaker',    kind: 'square', tag: 'SPEAKER',    price: '€295',   body: img('/vitrine/square/14.webp', 'Fabric wireless speaker') },
  { id: 'loafer',     kind: 'square', tag: 'LOAFER',     price: '€330',   body: img('/vitrine/square/15.webp', 'Cognac horsebit loafer') },
  { id: 'sneaker',    kind: 'square', tag: 'SNEAKER',    price: '€175',   body: img('/vitrine/square/16.webp', 'Off-white leather sneaker') },
  { id: 'boot',       kind: 'square', tag: 'BOOT',       price: '€590',   body: img('/vitrine/square/17.webp', 'Black Chelsea boot') },
  { id: 'bag',        kind: 'square', tag: 'BAG',        price: '€695',   body: img('/vitrine/square/18.webp', 'Tan top-handle bag') },
  { id: 'scarf',      kind: 'square', tag: 'SCARF',      price: '€220',   body: img('/vitrine/square/19.webp', 'Camel cashmere scarf') },
  { id: 'belt',       kind: 'square', tag: 'BELT',       price: '€140',   body: img('/vitrine/square/20.webp', 'Espresso leather belt') },
];
