'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import PriceCard from '@/components/PriceCard';
import LookCard from '@/components/LookCard';
import VisualModal from '@/components/VisualModal';
import ComparisonCard from '@/components/ComparisonCard';
import { compressImage } from '@/lib/image';
import type { Clarify, Comparison, Lang, Product, StandardResponse } from '@/lib/types';

type SceneKey =
  | 'uploadFashion'
  | 'uploadPrice'
  | 'price'
  | 'compare'
  | 'clarify'
  | 'fashion'
  | 'home'
  | 'priceTr';

type SceneSpec =
  | { kind: 'statement'; lines: string[]; hold: number }
  | {
      kind: 'chat';
      lang: Lang;
      mode: 'price' | 'fashion' | 'home' | 'electronics';
      prompt: string;
      status: string;
      aiText?: string;
      sceneKey: SceneKey;
      hold: number;
      openVisual?: boolean;
      source?: 'text' | 'upload';
    }
  | { kind: 'reveal' }
  | { kind: 'tagline' };

type AnchorImage = { imageBase64: string; mimeType: string; type?: string };
type PreparedScene = {
  products: Product[];
  responseText?: string;
  productName?: string;
  suggestions?: { name: string; searchQuery?: string; visualDescription?: string }[];
  imagePrompt?: string;
  preview?: string;
  anchor?: AnchorImage;
  comparison?: Comparison;
  clarify?: Clarify;
};

type PreparedData = Record<SceneKey, PreparedScene>;
type UploadSelection = {
  fashion?: File | null;
  price?: File | null;
};

const SCENES: SceneSpec[] = [
  {
    kind: 'statement',
    lines: [
      'İnternet her şeyi satıyor.',
      'Asıl mesele bu değil.',
      'Asıl mesele, seçim yapmak.',
    ],
    hold: 1800,
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'fashion',
    prompt: 'Bu fotoğrafı yükle ve buna göre tam bir kombin oluştur.',
    status: 'Görsel analiz ediliyor...',
    sceneKey: 'uploadFashion',
    hold: 2200,
    openVisual: true,
    source: 'upload',
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'price',
    prompt: 'Bu ürünü yükle ve aynısını daha ucuza bul.',
    status: 'Ürün eşleştiriliyor...',
    sceneKey: 'uploadPrice',
    hold: 4200,
    source: 'upload',
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'price',
    prompt: 'https://www.apple.com/shop/buy-iphone/iphone-15 - daha ucuzunu bul',
    status: 'Ürün bilgisi alınıyor...',
    aiText:
      'Buldum. Aynı modeli üç mağazada listeledim; kargo dahil toplam fiyata göre sıraladım.',
    sceneKey: 'price',
    hold: 4200,
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'electronics',
    prompt: 'Samsung Galaxy S24 mü, iPhone 15 mi?',
    status: 'Karşılaştırma hazırlanıyor...',
    aiText:
      'İkisini günlük kullanım, kamera ve fiyat açısından kıyasladım. Özet aşağıda.',
    sceneKey: 'compare',
    hold: 5200,
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'fashion',
    prompt: 'İş için bir ceket bul.',
    status: 'Tarz seçenekleri hazırlanıyor...',
    aiText: 'Daraltmak için iki şey sorayım:',
    sceneKey: 'clarify',
    hold: 4000,
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'fashion',
    prompt: 'Krem ipek elbise etrafında lacivert bir düğün daveti kombini kur. 400 EUR altı.',
    status: 'Kombin oluşturuluyor...',
    aiText:
      'Yaz sonu akşamı için sakin bir palet: krem ipek, yumuşak lacivert ve sıcak altın tonları. Altı parça, dört mağaza.',
    sceneKey: 'fashion',
    hold: 1600,
    openVisual: true,
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'home',
    prompt: '14 m2 bir okuma köşesi. Sıcak minimalizm. Bir boucle koltuk, alçak bir pirinç lamba.',
    status: 'Oda kurgulanıyor...',
    aiText: 'Doğal ışık etrafında sakin bir köşe kurdum. Boucle, ceviz ve pirinç tonlarıyla toplam 1.400 EUR altı.',
    sceneKey: 'home',
    hold: 1600,
    openVisual: true,
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'price',
    prompt: 'Aynı boucle koltuğu daha ucuza bul.',
    status: 'Mağazalar taranıyor...',
    aiText: 'Aynı modeli üç mağazada buldum. En ucuzu kargo dahil — fiyatlara göre sıraladım.',
    sceneKey: 'priceTr',
    hold: 4200,
  },
  { kind: 'reveal' },
  { kind: 'tagline' },
];

const PROMO_QUERIES = {
  price: { query: 'iPhone 15 128GB', mode: 'price' as const, language: 'en' as const },
  priceTr: { query: 'boucle koltuk fildisi', mode: 'price' as const, language: 'tr' as const },
  fashion: {
    queries: [
      'cream silk slip dress',
      'navy suede heel',
      'pearl drop earring',
      'navy satin clutch',
      'tortoise hair claw',
      'cashmere wrap shawl',
    ],
    mode: 'fashion' as const,
    language: 'en' as const,
  },
  home: {
    queries: [
      'boucle armchair ivory',
      'low brass floor lamp',
      'walnut side table',
      'wool rug 120x170 natural',
    ],
    mode: 'home' as const,
    language: 'en' as const,
  },
};

const TYPE_SPEED = 38;
const STATEMENT_TYPE_SPEED = 55;
const VISUAL_OPEN_DELAY_MS = 1600;
const VISUAL_AUTO_CLOSE_MS = 5500;
const VISUAL_FAILSAFE_CLOSE_MS = 20000;

const FASHION_SUGGESTIONS = [
  { name: 'Krem ipek askılı elbise', searchQuery: 'cream silk slip dress', visualDescription: 'cream silk slip dress' },
  { name: 'Lacivert süet topuklu', searchQuery: 'navy suede heel', visualDescription: 'navy suede heel' },
  { name: 'İnci sallantılı küpe', searchQuery: 'pearl drop earring', visualDescription: 'pearl drop earring' },
  { name: 'Lacivert saten clutch', searchQuery: 'navy satin clutch', visualDescription: 'navy satin clutch' },
  { name: 'Boynuz desen saç tokası', searchQuery: 'tortoise hair claw', visualDescription: 'tortoise hair claw' },
  { name: 'Kaşmir şal', searchQuery: 'cashmere wrap shawl', visualDescription: 'cashmere wrap shawl' },
];
const HOME_SUGGESTIONS = [
  { name: 'Fildişi boucle koltuk', searchQuery: 'boucle armchair ivory', visualDescription: 'boucle armchair ivory' },
  { name: 'Alçak pirinç yer lambası', searchQuery: 'low brass floor lamp', visualDescription: 'low brass floor lamp' },
  { name: 'Ceviz yan sehpa', searchQuery: 'walnut side table', visualDescription: 'walnut side table' },
  { name: 'Doğal yün halı 120×170', searchQuery: 'wool rug 120x170 natural', visualDescription: 'wool rug 120x170 natural' },
];

const FASHION_IMAGE_PROMPT =
  'Editorial flat-lay fashion photo on a soft neutral off-white background. Outfit featuring: cream silk slip dress, navy suede heel, pearl drop earring, navy satin clutch, tortoise hair claw, cashmere wrap shawl. Clean editorial magazine styling, soft natural light, no people, no text, no watermarks.';
const HOME_IMAGE_PROMPT =
  'Cozy interior design render of a small reading corner. Featuring: a boucle ivory armchair, a low brass floor lamp, a walnut side table, a wool natural rug. Warm minimalist styling, natural side-light from a window, editorial aesthetic, no text, no watermarks.';

function useTyped(text: string, speed: number, start: boolean, onDone?: () => void) {
  const [out, setOut] = useState('');
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);
  useEffect(() => {
    setOut('');
    if (!start) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        onDoneRef.current?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, start]);
  return out;
}

function Logo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '1.25px solid var(--ink)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '-.04em',
        }}
      >
        O
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-.045em' }}>OBEN</span>
    </div>
  );
}

function StatementScene({
  lines,
  hold,
  onDone,
}: {
  lines: string[];
  hold: number;
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const current = lines[idx] ?? '';
  const typed = useTyped(current, STATEMENT_TYPE_SPEED, true, () => {
    setTimeout(() => {
      if (idx + 1 < lines.length) setIdx(idx + 1);
      else setTimeout(onDone, hold);
    }, hold);
  });
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 48px',
      }}
    >
      <div
        key={idx}
        style={{
          fontSize: 'clamp(32px, 3.6vw, 46px)',
          fontWeight: 400,
          letterSpacing: '-.035em',
          lineHeight: 1.1,
          color: 'var(--ink)',
          maxWidth: 900,
          textAlign: 'center',
        }}
      >
        {typed}
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: '1em',
            background: 'var(--ink)',
            verticalAlign: '-0.1em',
            marginLeft: 3,
            animation: 'oben-caret 0.9s steps(1) infinite',
          }}
        />
      </div>
      <style jsx>{`
        @keyframes oben-caret {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function HeaderBar({ lang, mode }: { lang: Lang; mode: 'price' | 'fashion' | 'home' | 'electronics' }) {
  const modeLabel: Record<typeof mode, { en: string; tr: string }> = {
    price: { en: 'Price', tr: 'Fiyat' },
    fashion: { en: 'Fashion', tr: 'Moda' },
    home: { en: 'Home', tr: 'Ev' },
    electronics: { en: 'Electronics', tr: 'Elektronik' },
  };
  return (
    <header
      style={{
        height: 54,
        flex: '0 0 54px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        background: 'var(--bg)',
      }}
    >
      <Logo />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            background: 'var(--pill)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '-.005em',
          }}
        >
          {modeLabel[mode][lang]}
        </div>
        <div
          style={{
            padding: '2px 2px',
            borderRadius: 999,
            background: 'var(--pill)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '.04em',
            display: 'inline-flex',
          }}
        >
          <span
            style={{
              padding: '2px 9px',
              borderRadius: 999,
              background: lang === 'en' ? 'var(--ink)' : 'transparent',
              color: lang === 'en' ? 'var(--bg)' : 'var(--muted)',
              transition: 'all .3s ease',
            }}
          >
            EN
          </span>
          <span
            style={{
              padding: '2px 9px',
              borderRadius: 999,
              background: lang === 'tr' ? 'var(--ink)' : 'transparent',
              color: lang === 'tr' ? 'var(--bg)' : 'var(--muted)',
              transition: 'all .3s ease',
            }}
          >
            TR
          </span>
        </div>
      </div>
    </header>
  );
}

function UserUploadBubble({ preview, prompt }: { preview?: string; prompt: string }) {
  return (
    <div
      style={{
        background: '#F0F0EE',
        padding: 12,
        borderRadius: 18,
        maxWidth: '70%',
        minWidth: 280,
        width: 380,
      }}
    >
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          style={{
            width: '100%',
            maxHeight: 260,
            objectFit: 'contain',
            borderRadius: 12,
            display: 'block',
            marginBottom: 10,
            background: '#FFFFFF',
            border: '1px solid var(--line-soft)',
          }}
        />
      )}
      <div style={{ fontSize: 14.5, lineHeight: 1.45, letterSpacing: '-.005em' }}>{prompt}</div>
    </div>
  );
}

function ChatScene({
  scene,
  prepared,
  onDone,
  onOpenVisual,
}: {
  scene: Extract<SceneSpec, { kind: 'chat' }>;
  prepared: PreparedData;
  onDone: () => void;
  onOpenVisual: (sceneKey: SceneKey) => void;
}) {
  const [phase, setPhase] = useState<'typing' | 'resolving' | 'thinking' | 'response'>('typing');
  const sceneData = prepared[scene.sceneKey];
  const typedPrompt = useTyped(scene.prompt, TYPE_SPEED, phase === 'typing', () => {
    setTimeout(() => setPhase('resolving'), 350);
  });

  useEffect(() => {
    if (phase === 'resolving') {
      const id = setTimeout(() => setPhase('thinking'), 1400);
      return () => clearTimeout(id);
    }
    if (phase === 'thinking') {
      const id = setTimeout(() => setPhase('response'), 1100);
      return () => clearTimeout(id);
    }
    if (phase === 'response') {
      if (scene.openVisual && sceneData.products.length > 0) {
        const openId = window.setTimeout(() => onOpenVisual(scene.sceneKey), VISUAL_OPEN_DELAY_MS);
        return () => window.clearTimeout(openId);
      }
      const id = setTimeout(onDone, 5200 + scene.hold);
      return () => clearTimeout(id);
    }
  }, [phase, scene, sceneData.products.length, onDone, onOpenVisual]);

  const aiText = sceneData.responseText || scene.aiText || '';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <HeaderBar lang={scene.lang} mode={scene.mode} />

      <section style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: 780, width: '100%', margin: '40px auto 0', padding: '0 28px', flex: 1 }}>
          {(phase !== 'typing' || typedPrompt.length > 0) && (
            <div
              className="oben-msg-in"
              style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 0' }}
            >
              {scene.source === 'upload' ? (
                <UserUploadBubble preview={sceneData.preview} prompt={scene.prompt} />
              ) : (
                <div
                  style={{
                    background: '#F0F0EE',
                    padding: '10px 16px',
                    borderRadius: 18,
                    maxWidth: '70%',
                    fontSize: 14.5,
                    lineHeight: 1.45,
                    letterSpacing: '-.005em',
                  }}
                >
                  {phase === 'typing' ? typedPrompt : scene.prompt}
                  {phase === 'typing' && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 1.5,
                        height: '1em',
                        background: 'var(--ink)',
                        verticalAlign: '-0.1em',
                        marginLeft: 2,
                        animation: 'oben-caret 0.9s steps(1) infinite',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {(phase === 'resolving' || phase === 'thinking') && (
            <div className="oben-msg-in" style={{ padding: '18px 0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '-.005em',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: 'oben-pulse 1.2s ease-in-out infinite',
                  }}
                />
                <span>
                  {phase === 'resolving'
                    ? scene.status
                    : scene.lang === 'tr'
                    ? 'Düşünüyor...'
                    : 'Thinking...'}
                </span>
                <span className="oben-typing">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}

          {phase === 'response' && (
            <div className="oben-msg-in" style={{ padding: '20px 0 8px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.12em',
                  fontWeight: 500,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                  }}
                />
                OBEN
              </div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  letterSpacing: '-.005em',
                }}
              >
                {aiText}
              </p>
              {scene.mode === 'price' && sceneData.products.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <PriceCard
                    productName={sceneData.productName || sceneData.products[0]?.name}
                    retailers={sceneData.products}
                    onAdd={() => {}}
                    onOpenModal={() => {}}
                    lang={scene.lang}
                  />
                </div>
              )}
              {(scene.mode === 'fashion' || scene.mode === 'home') && sceneData.products.length > 0 && (
                <div style={{ transform: 'translateX(-10px)', width: 'calc(100% + 20px)' }}>
                  <LookCard
                    variant={scene.mode}
                    items={sceneData.products}
                    hasVisual={true}
                    suggestions={sceneData.suggestions}
                    onAdd={() => {}}
                    onOpenModal={() => onOpenVisual(scene.sceneKey)}
                    lang={scene.lang}
                  />
                </div>
              )}
              {sceneData.comparison && (
                <ComparisonCard comparison={sceneData.comparison} lang={scene.lang} />
              )}
              {sceneData.clarify?.groups?.length ? (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '.12em',
                      fontWeight: 500,
                      marginBottom: 10,
                    }}
                  >
                    {scene.lang === 'tr' ? 'Birkaç soru' : 'A few questions'}
                  </div>
                  {sceneData.clarify.groups.map((grp, gi) => (
                    <div key={gi} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: 'var(--ink)',
                          marginBottom: 6,
                          fontWeight: 500,
                          letterSpacing: '-.005em',
                        }}
                      >
                        {grp.question}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {grp.options.map((opt) => (
                          <span
                            key={opt}
                            style={{
                              padding: '5px 11px',
                              borderRadius: 999,
                              border: '1px solid var(--line)',
                              background: 'var(--bg-soft)',
                              fontSize: 12.5,
                              color: 'var(--ink)',
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {sceneData.clarify.allowOther && (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: 'var(--muted)',
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}
                    >
                      {scene.lang === 'tr' ? 'veya kendi cevabını yaz' : 'or type your own'}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--line)', padding: '14px 28px', background: 'var(--bg)' }}>
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '12px 14px',
            background: 'var(--bg-soft)',
            fontSize: 14,
            color: 'var(--muted-2)',
            letterSpacing: '-.005em',
          }}
        >
          {scene.lang === 'tr'
            ? 'Bir link yapıştır veya tarif et...'
            : 'Paste a link or describe what you need...'}
        </div>
      </div>

      <style jsx>{`
        @keyframes oben-caret {
          50% {
            opacity: 0;
          }
        }
        @keyframes oben-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.85);
          }
        }
      `}</style>
    </div>
  );
}

function RevealScene({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 4200);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '.22em',
          fontWeight: 500,
          animation: 'oben-fade-up .9s ease both',
        }}
        >
          Tanışın
        </div>
      <div
        style={{
          fontSize: 'clamp(72px, 11vw, 160px)',
          fontWeight: 500,
          letterSpacing: '-.05em',
          lineHeight: 1,
          animation: 'oben-fade-up 1.4s ease both .35s',
        }}
      >
        Oben.
      </div>
      <style jsx>{`
        @keyframes oben-fade-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function TaglineScene({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 5000);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ animation: 'oben-fade .9s ease both', transform: 'scale(1.6)' }}>
        <Logo />
      </div>
      <div
        style={{
          fontSize: 18,
          color: 'var(--muted)',
          letterSpacing: '-.005em',
          marginTop: 18,
          animation: 'oben-fade 1.2s ease both .5s',
        }}
      >
        Alışverişin daha sakin yolu.
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--muted-2)',
          marginTop: 36,
          letterSpacing: '.08em',
          animation: 'oben-fade 1.2s ease both 1.1s',
        }}
      >
        oben.app
      </div>
    </div>
  );
}

async function searchOne(query: string, mode: 'price' | 'fashion' | 'home', language: Lang): Promise<Product[]> {
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode, language }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: Product[] };
    return data.products ?? [];
  } catch {
    return [];
  }
}

async function fetchSceneImage(path: string): Promise<{ base64: string; mimeType: string; preview: string }> {
  const res = await fetch(path);
  const blob = await res.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(blob);
  });
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('invalid_data_url');
  }
  return { mimeType: match[1], base64: match[2], preview: dataUrl };
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

async function toPromoUpload(file: File): Promise<{ base64: string; mimeType: string; preview: string }> {
  const { base64, mimeType } = await compressImage(file);
  const preview = await fileToDataUrl(file);
  return {
    base64,
    mimeType,
    preview,
  };
}

async function analyzeImage({
  imageBase64,
  mimeType,
  mode,
  language,
  message,
}: {
  imageBase64: string;
  mimeType: string;
  mode: 'price' | 'fashion';
  language: Lang;
  message: string;
}): Promise<StandardResponse | null> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        mode,
        language,
        message,
        chatHistory: [],
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as StandardResponse;
  } catch {
    return null;
  }
}

function pickUniqueProducts(groups: Product[][], fallbackNames: string[]): Product[] {
  const usedRetailers = new Set<string>();
  return groups
    .map((items, idx) => {
      if (!items.length) return null;
      let chosen = items.find((it) => it.price !== null && !usedRetailers.has(it.retailer));
      if (!chosen) chosen = items.find((it) => !usedRetailers.has(it.retailer));
      if (!chosen) chosen = items.find((it) => it.price !== null) ?? items[0];
      if (!chosen) return null;
      usedRetailers.add(chosen.retailer);
      return fallbackNames[idx] ? { ...chosen, name: fallbackNames[idx] } : chosen;
    })
    .filter((item): item is Product => !!item);
}

function buildPromptFallbackProducts(names: string[], mode: 'fashion' | 'home'): Product[] {
  return names.map((name, idx) => ({
    name,
    price: mode === 'fashion' ? 49 + idx * 18 : 180 + idx * 95,
    currency: 'EUR',
    thumbnail: '/vitrine/square/01.webp',
    link: '#',
    retailer: ['Zara', 'IKEA', 'H&M Home', 'Mango', 'Amazon', 'Westwing'][idx % 6],
  }));
}

function getSceneAiText(sceneKey: SceneKey): string | undefined {
  const match = SCENES.find(
    (scene): scene is Extract<SceneSpec, { kind: 'chat' }> =>
      scene.kind === 'chat' && scene.sceneKey === sceneKey,
  );
  return match?.aiText;
}

export default function PromoPage() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [prepared, setPrepared] = useState<PreparedData | null>(null);
  const [visualKey, setVisualKey] = useState<SceneKey | null>(null);
  const [uploads, setUploads] = useState<UploadSelection>({});
  const [shouldAdvanceAfterVisual, setShouldAdvanceAfterVisual] = useState(false);
  const generatedCloseTimerRef = useRef<number | null>(null);

  const advance = () => setSceneIdx((i) => (i + 1 < SCENES.length ? i + 1 : i));
  const clearVisual = (advanceAfterClose = false) => {
    if (generatedCloseTimerRef.current !== null) {
      window.clearTimeout(generatedCloseTimerRef.current);
      generatedCloseTimerRef.current = null;
    }
    setShouldAdvanceAfterVisual(advanceAfterClose);
    setVisualKey(null);
  };
  const restart = () => {
    setSceneIdx(0);
    clearVisual();
    setRunning(false);
    setTimeout(() => setRunning(true), 50);
  };

  const visualScene = visualKey && prepared ? prepared[visualKey] : null;
  const visualLang = useMemo(() => {
    if (!visualKey) return 'en' as Lang;
    const match = SCENES.find((scene): scene is Extract<SceneSpec, { kind: 'chat' }> => scene.kind === 'chat' && scene.sceneKey === visualKey);
    return match?.lang ?? 'en';
  }, [visualKey]);

  useEffect(() => {
    if (!visualKey) return;
    const closeId = window.setTimeout(() => {
      clearVisual(true);
    }, VISUAL_FAILSAFE_CLOSE_MS);
    return () => {
      window.clearTimeout(closeId);
    };
  }, [visualKey]);

  useEffect(() => {
    if (!shouldAdvanceAfterVisual || visualKey) return;
    const id = window.setTimeout(() => {
      setShouldAdvanceAfterVisual(false);
      advance();
    }, 350);
    return () => window.clearTimeout(id);
  }, [shouldAdvanceAfterVisual, visualKey]);

  const prefetch = async () => {
    setLoading(true);
    setProgress('Görsel yükleme sahneleri hazırlanıyor...');

    const [uploadFashion, uploadPrice] = await Promise.all([
      uploads.fashion ? toPromoUpload(uploads.fashion) : fetchSceneImage('/vitrine/square/02.webp'),
      uploads.price ? toPromoUpload(uploads.price) : fetchSceneImage('/vitrine/square/05.webp'),
    ]);

    setProgress('Yüklenen kombin analiz ediliyor...');
    const fashionAnalysis = await analyzeImage({
      imageBase64: uploadFashion.base64,
      mimeType: uploadFashion.mimeType,
      mode: 'fashion',
      language: 'tr',
      message: 'Bu görsele göre tam bir kombin oluştur.',
    });

    let uploadFashionProducts: Product[] = [];
    let uploadFashionSuggestions = fashionAnalysis?.suggestions?.slice(0, 6) ?? [];
    if (uploadFashionSuggestions.length > 0) {
      const groups = await Promise.all(
        uploadFashionSuggestions.map((suggestion) => searchOne(suggestion.searchQuery, 'fashion', 'en')),
      );
      uploadFashionProducts = pickUniqueProducts(
        groups,
        uploadFashionSuggestions.map((suggestion) => suggestion.name),
      );
    }
    if (uploadFashionProducts.length === 0) {
      const fallbackNames = uploadFashionSuggestions.map((suggestion) => suggestion.name);
      uploadFashionProducts = buildPromptFallbackProducts(
        fallbackNames.length > 0 ? fallbackNames : ['tailored trouser', 'minimal heel', 'structured bag'],
        'fashion',
      );
    }

    setProgress('Aynı ürün daha ucuza aranıyor...');
    const priceAnalysis = await analyzeImage({
      imageBase64: uploadPrice.base64,
      mimeType: uploadPrice.mimeType,
      mode: 'price',
      language: 'tr',
      message: 'Bu ürünün aynısını daha ucuza bul.',
    });
    const priceQuery =
      priceAnalysis?.suggestions?.[0]?.searchQuery ||
      priceAnalysis?.identifiedItem?.name ||
      'minimal leather shoulder bag';
    const uploadPriceProducts = await searchOne(priceQuery, 'price', 'tr');

    setProgress('Mağazalar taranıyor (fiyat)...');
    const price = await searchOne(PROMO_QUERIES.price.query, 'price', 'tr');

    setProgress('Mağazalar taranıyor (fiyat · TR)...');
    const priceTr = await searchOne(PROMO_QUERIES.priceTr.query, 'price', 'tr');

    setProgress('Kombin parçaları aranıyor...');
    const fashionAll = await Promise.all(
      PROMO_QUERIES.fashion.queries.map((q) => searchOne(q, 'fashion', 'tr')),
    );
    const fashion = fashionAll
      .map((arr) => arr.find((p) => p.price !== null) ?? arr[0])
      .filter((p): p is Product => !!p);

    setProgress('Ev parçaları aranıyor...');
    const homeAll = await Promise.all(
      PROMO_QUERIES.home.queries.map((q) => searchOne(q, 'home', 'tr')),
    );
    const home = homeAll
      .map((arr) => arr.find((p) => p.price !== null) ?? arr[0])
      .filter((p): p is Product => !!p);

    setPrepared({
      uploadFashion: {
        products: uploadFashionProducts,
        responseText:
          fashionAnalysis?.text ||
          'Yüklediğin parça etrafında: temiz katmanlar, yumuşak kontrast ve uyumlu mağazalardan dengeli bir seçim.',
        productName: fashionAnalysis?.identifiedItem?.name,
        suggestions: uploadFashionSuggestions.map((suggestion) => ({
          name: suggestion.name,
          searchQuery: suggestion.searchQuery,
          visualDescription: suggestion.visualDescription,
        })),
        imagePrompt: fashionAnalysis?.imagePrompt,
        preview: uploadFashion.preview,
        anchor: {
          imageBase64: uploadFashion.base64,
          mimeType: uploadFashion.mimeType,
          type: fashionAnalysis?.identifiedItem?.type || fashionAnalysis?.identifiedItem?.name,
        },
      },
      uploadPrice: {
        products: uploadPriceProducts,
        responseText:
          priceAnalysis?.text ||
          'Ürünü eşleştirdim. Neredeyse aynı listeleri ucuzdan pahalıya sıraladım.',
        productName: priceAnalysis?.identifiedItem?.name || uploadPriceProducts[0]?.name,
        preview: uploadPrice.preview,
        anchor: {
          imageBase64: uploadPrice.base64,
          mimeType: uploadPrice.mimeType,
          type: priceAnalysis?.identifiedItem?.type || priceAnalysis?.identifiedItem?.name,
        },
      },
      price: {
        products: price,
        responseText: getSceneAiText('price'),
        productName: price[0]?.name,
      },
      compare: {
        products: [],
        responseText: getSceneAiText('compare'),
        comparison: {
          items: [
            {
              name: 'Samsung Galaxy S24',
              summary: 'Daha esnek yapay zekâ paketi ve daha açık kamera kontrolü.',
              pros: ['Galaxy AI çeviri ve özetleme', 'Daha geniş ekran modları', 'Daha hızlı şarj'],
              cons: ['Pil ömrü iPhone\'a göre kısa', 'İkinci el değeri daha düşük'],
              bestFor: 'Yapay zekâ ve özelleştirme isteyen Android kullanıcısı',
            },
            {
              name: 'iPhone 15',
              summary: 'Daha dengeli ve uzun ömürlü; iOS ekosisteminde sıkı entegrasyon.',
              pros: ['Daha uzun pil ömrü', 'Akıcı arayüz', 'Yüksek ikinci el değeri'],
              cons: ['Sınırlı özelleştirme', 'Temel modelde USB-C hızı düşük'],
              bestFor: 'iOS dünyasında olan ve uzun ömürlü cihaz isteyen kullanıcı',
            },
          ],
          winner: 'iPhone 15',
          verdict:
            'Günlük dengeli kullanım için iPhone 15, yapay zekâ ve özelleştirme için Galaxy S24.',
        },
      },
      clarify: {
        products: [],
        responseText: getSceneAiText('clarify'),
        clarify: {
          groups: [
            {
              question: 'Hangi kesim?',
              options: ['Oversized', 'Slim', 'Klasik'],
            },
            {
              question: 'Renk paleti?',
              options: ['Nötr', 'Toprak', 'Koyu', 'Pastel'],
            },
          ],
          allowOther: true,
        },
      },
      priceTr: {
        products: priceTr,
        responseText: getSceneAiText('priceTr'),
        productName: priceTr[0]?.name,
      },
      fashion: {
        products: fashion,
        responseText: getSceneAiText('fashion'),
        productName: fashion[0]?.name,
        suggestions: FASHION_SUGGESTIONS,
        imagePrompt: FASHION_IMAGE_PROMPT,
      },
      home: {
        products: home,
        responseText: getSceneAiText('home'),
        productName: home[0]?.name,
        suggestions: HOME_SUGGESTIONS,
        imagePrompt: HOME_IMAGE_PROMPT,
      },
    });
    setLoading(false);
    setRunning(true);
  };

  const currentScene = SCENES[sceneIdx];

  if (!running && !loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 28,
          padding: '40px 32px',
        }}
      >
        <Logo />
        <div
          style={{
            fontSize: 13,
            color: 'var(--muted)',
            letterSpacing: '-.005em',
          maxWidth: 560,
          textAlign: 'center',
          lineHeight: 1.55,
        }}
      >
          Promo akışı artık görsel yükleyip kombin oluşturma ve görselden aynı ürünü daha ucuza bulma sahnelerini de içeriyor.
          Görsel modal kendi kendine kapanıyor ve üretim tamamlanınca akış devam ediyor.
        </div>
        <div
          style={{
            width: 'min(720px, 100%)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          <label
            style={{
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 16,
              background: 'var(--bg-soft)',
              display: 'grid',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Kombin Görseli Yükle
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              İsteğe bağlı. Kombin oluşturma sahnesinde kullanılır. Boş bırakırsanız hazır örnek kullanılır.
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setUploads((prev) => ({ ...prev, fashion: event.target.files?.[0] ?? null }))
              }
            />
            <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>{uploads.fashion?.name || 'Dosya seçilmedi'}</span>
          </label>
          <label
            style={{
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 16,
              background: 'var(--bg-soft)',
              display: 'grid',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Ürün Görseli Yükle
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              İsteğe bağlı. Aynı ürünü daha ucuza bulma sahnesinde kullanılır. Boş bırakırsanız hazır örnek kullanılır.
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setUploads((prev) => ({ ...prev, price: event.target.files?.[0] ?? null }))
              }
            />
            <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>{uploads.price?.name || 'Dosya seçilmedi'}</span>
          </label>
        </div>
        <button
          onClick={prefetch}
          style={{
            padding: '10px 22px',
            border: '1px solid var(--ink)',
            borderRadius: 6,
            fontSize: 13.5,
            fontWeight: 500,
            letterSpacing: '-.005em',
            background: 'var(--ink)',
            color: 'var(--bg)',
            cursor: 'pointer',
          }}
        >
          Verileri yükle ve oynat
        </button>
        <div style={{ fontSize: 11, color: 'var(--muted-2)', textAlign: 'center' }}>
          İpucu: önce tam ekrana geçip sonra kayda başlayın. Üretilen görseller daha uzun ekranda kalsın
          isterseniz <code>VISUAL_AUTO_CLOSE_MS</code> değerini artırın.
        </div>
      </div>
    );
  }

  if (loading || !prepared) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <Logo />
        <div
          style={{
            fontSize: 12,
            color: 'var(--muted)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          {progress || 'Yükleniyor...'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ cursor: 'none' }}>
      {currentScene.kind === 'statement' && (
        <StatementScene key={sceneIdx} lines={currentScene.lines} hold={currentScene.hold} onDone={advance} />
      )}
      {currentScene.kind === 'chat' && (
        <ChatScene
          key={sceneIdx}
          scene={currentScene}
          prepared={prepared}
          onDone={advance}
          onOpenVisual={(sceneKey) => {
            if (sceneKey !== 'fashion' && sceneKey !== 'home' && sceneKey !== 'uploadFashion') return;
            setShouldAdvanceAfterVisual(false);
            setVisualKey(sceneKey);
          }}
        />
      )}
      {currentScene.kind === 'reveal' && <RevealScene key={sceneIdx} onDone={advance} />}
      {currentScene.kind === 'tagline' && <TaglineScene key={sceneIdx} onDone={restart} />}

      {visualKey && visualScene && (
        <VisualModal
          kind={visualKey === 'home' ? 'home' : 'fashion'}
          description={visualScene.responseText || visualScene.imagePrompt || ''}
          items={visualScene.products}
          imagePrompt={visualScene.imagePrompt}
          pieces={(visualScene.suggestions ?? []).map((suggestion) => ({
            description: suggestion.visualDescription || suggestion.name,
          }))}
          anchor={visualScene.anchor}
          onGenerated={() => {
            if (generatedCloseTimerRef.current !== null) {
              window.clearTimeout(generatedCloseTimerRef.current);
            }
            generatedCloseTimerRef.current = window.setTimeout(() => {
              generatedCloseTimerRef.current = null;
              clearVisual(true);
            }, VISUAL_AUTO_CLOSE_MS);
          }}
          onClose={() => clearVisual(false)}
          onAdd={() => {}}
          lang={visualLang}
        />
      )}

      <button
        onClick={restart}
        className="oben-promo-restart"
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          padding: '6px 10px',
          fontSize: 11,
          color: 'var(--muted-2)',
          border: '1px solid var(--line)',
          borderRadius: 4,
          background: 'var(--bg-soft)',
          opacity: 0.4,
          cursor: 'pointer',
        }}
      >
        tekrar
      </button>
      <style jsx global>{`
        .oben-promo-restart:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
