'use client';

import { useEffect, useRef, useState } from 'react';
import PriceCard from '@/components/PriceCard';
import LookCard from '@/components/LookCard';
import VisualModal from '@/components/VisualModal';
import type { Lang, Product } from '@/lib/types';

type SceneSpec =
  | { kind: 'statement'; lines: string[]; hold: number }
  | {
      kind: 'chat';
      lang: Lang;
      mode: 'price' | 'fashion' | 'home';
      prompt: string;
      status: string;
      aiText: string;
      sceneKey: 'price' | 'fashion' | 'home' | 'priceTr';
      hold: number;
      openVisual?: boolean;
    }
  | { kind: 'reveal' }
  | { kind: 'tagline' };

const SCENES: SceneSpec[] = [
  {
    kind: 'statement',
    lines: [
      'The internet sells everything.',
      'That has never been the problem.',
      'The problem is choosing.',
    ],
    hold: 1800,
  },
  {
    kind: 'chat',
    lang: 'en',
    mode: 'price',
    prompt: 'https://www.apple.com/shop/buy-iphone/iphone-15 — find this cheaper',
    status: 'Fetching product…',
    aiText:
      'Found it. Same model across three retailers, sorted by total price including shipping.',
    sceneKey: 'price',
    hold: 4200,
  },
  {
    kind: 'chat',
    lang: 'en',
    mode: 'fashion',
    prompt: 'A navy wedding-guest look around a cream silk slip dress. Under €400.',
    status: 'Styling the look…',
    aiText:
      'A late-summer evening palette: cream silk, soft navy, brushed gold. Six pieces, four retailers.',
    sceneKey: 'fashion',
    hold: 1600,
    openVisual: true,
  },
  {
    kind: 'chat',
    lang: 'en',
    mode: 'home',
    prompt: 'A 14m² reading corner. Warm minimalism. One boucle chair, a low brass lamp.',
    status: 'Composing the room…',
    aiText: 'A quiet corner around natural light. Boucle, walnut, brass. Total under €1,400.',
    sceneKey: 'home',
    hold: 1600,
    openVisual: true,
  },
  {
    kind: 'chat',
    lang: 'tr',
    mode: 'price',
    prompt: 'Aynı boucle koltuğu daha ucuza bul.',
    status: 'Mağazalar taranıyor…',
    aiText:
      'Aynı modeli üç mağazada buldum. En ucuzu kargo dahil — fiyatlara göre sıraladım.',
    sceneKey: 'priceTr',
    hold: 4200,
  },
  { kind: 'reveal' },
  { kind: 'tagline' },
];

const PROMO_QUERIES = {
  price: { query: 'iPhone 15 128GB', mode: 'price' as const, language: 'en' as const },
  priceTr: { query: 'boucle koltuk fildişi', mode: 'price' as const, language: 'tr' as const },
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

const FASHION_SUGGESTIONS = PROMO_QUERIES.fashion.queries.map((q) => ({
  name: q,
  searchQuery: q,
  visualDescription: q,
}));
const HOME_SUGGESTIONS = PROMO_QUERIES.home.queries.map((q) => ({
  name: q,
  searchQuery: q,
  visualDescription: q,
}));

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

function HeaderBar({ lang, mode }: { lang: Lang; mode: 'price' | 'fashion' | 'home' }) {
  const modeLabel: Record<typeof mode, { en: string; tr: string }> = {
    price: { en: 'Price', tr: 'Fiyat' },
    fashion: { en: 'Fashion', tr: 'Moda' },
    home: { en: 'Home', tr: 'Ev' },
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

function ChatScene({
  scene,
  data,
  onDone,
  onOpenVisual,
}: {
  scene: Extract<SceneSpec, { kind: 'chat' }>;
  data: { price: Product[]; priceTr: Product[]; fashion: Product[]; home: Product[] };
  onDone: () => void;
  onOpenVisual: (kind: 'fashion' | 'home', items: Product[]) => void;
}) {
  const [phase, setPhase] = useState<'typing' | 'resolving' | 'thinking' | 'response'>('typing');
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
      const items =
        scene.sceneKey === 'fashion'
          ? data.fashion
          : scene.sceneKey === 'home'
          ? data.home
          : [];
      if (scene.openVisual && items.length > 0) {
        const openId = setTimeout(() => {
          onOpenVisual(scene.sceneKey as 'fashion' | 'home', items);
        }, 1600);
        const doneId = setTimeout(onDone, 14000 + scene.hold);
        return () => {
          clearTimeout(openId);
          clearTimeout(doneId);
        };
      }
      const id = setTimeout(onDone, 5200 + scene.hold);
      return () => clearTimeout(id);
    }
  }, [phase, scene, data, onDone, onOpenVisual]);

  const products: Product[] =
    scene.sceneKey === 'price'
      ? data.price
      : scene.sceneKey === 'priceTr'
      ? data.priceTr
      : scene.sceneKey === 'fashion'
      ? data.fashion
      : data.home;

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
                    ? 'Düşünüyor…'
                    : 'Thinking…'}
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
                {scene.aiText}
              </p>
              {scene.mode === 'price' && products.length > 0 && (
                <PriceCard
                  productName={products[0]?.name}
                  retailers={products}
                  onAdd={() => {}}
                  onOpenModal={() => {}}
                  lang={scene.lang}
                />
              )}
              {(scene.mode === 'fashion' || scene.mode === 'home') && products.length > 0 && (
                <LookCard
                  variant={scene.mode}
                  items={products}
                  hasVisual={true}
                  suggestions={scene.mode === 'fashion' ? FASHION_SUGGESTIONS : HOME_SUGGESTIONS}
                  onAdd={() => {}}
                  onOpenModal={() =>
                    onOpenVisual(scene.mode as 'fashion' | 'home', products)
                  }
                  lang={scene.lang}
                />
              )}
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
            ? 'Bir link yapıştır veya tarif et…'
            : 'Paste a link or describe what you need…'}
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
        Introducing
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
        A quieter way to shop.
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

export default function PromoPage() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [data, setData] = useState<{ price: Product[]; priceTr: Product[]; fashion: Product[]; home: Product[] } | null>(null);
  const [visual, setVisual] = useState<{
    kind: 'fashion' | 'home';
    items: Product[];
    description: string;
    imagePrompt: string;
    suggestions: { description: string }[];
  } | null>(null);

  const advance = () => setSceneIdx((i) => (i + 1 < SCENES.length ? i + 1 : i));
  const restart = () => {
    setSceneIdx(0);
    setVisual(null);
    setRunning(false);
    setTimeout(() => setRunning(true), 50);
  };

  const prefetch = async () => {
    setLoading(true);
    setProgress('Searching retailers (price)…');
    const price = await searchOne(PROMO_QUERIES.price.query, 'price', 'en');

    setProgress('Searching retailers (price · TR)…');
    const priceTr = await searchOne(PROMO_QUERIES.priceTr.query, 'price', 'tr');

    setProgress('Searching outfit pieces…');
    const fashionAll = await Promise.all(
      PROMO_QUERIES.fashion.queries.map((q) => searchOne(q, 'fashion', 'en')),
    );
    const fashion = fashionAll
      .map((arr) => arr.find((p) => p.price !== null) ?? arr[0])
      .filter((p): p is Product => !!p);

    setProgress('Searching home pieces…');
    const homeAll = await Promise.all(
      PROMO_QUERIES.home.queries.map((q) => searchOne(q, 'home', 'en')),
    );
    const home = homeAll
      .map((arr) => arr.find((p) => p.price !== null) ?? arr[0])
      .filter((p): p is Product => !!p);

    setData({ price, priceTr, fashion, home });
    setLoading(false);
    setRunning(true);
  };

  if (!running && !loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 28,
          padding: '0 32px',
        }}
      >
        <Logo />
        <div
          style={{
            fontSize: 13,
            color: 'var(--muted)',
            letterSpacing: '-.005em',
            maxWidth: 420,
            textAlign: 'center',
            lineHeight: 1.55,
          }}
        >
          Promo reel · ~70s. Live products from /api/search. Imagen visuals generated on demand during the
          Fashion and Home scenes. Press play, then start your screen recorder.
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
          Load data & play
        </button>
        <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>
          tip: F11 fullscreen · ⌘⇧5 (mac) / Win+G (win) to record
        </div>
      </div>
    );
  }

  if (loading || !data) {
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
          {progress || 'Loading…'}
        </div>
      </div>
    );
  }

  const scene = SCENES[sceneIdx];

  return (
    <div style={{ cursor: 'none' }}>
      {scene.kind === 'statement' && (
        <StatementScene key={sceneIdx} lines={scene.lines} hold={scene.hold} onDone={advance} />
      )}
      {scene.kind === 'chat' && (
        <ChatScene
          key={sceneIdx}
          scene={scene}
          data={data}
          onDone={advance}
          onOpenVisual={(kind, items) => {
            setVisual({
              kind,
              items,
              description: kind === 'fashion' ? FASHION_IMAGE_PROMPT : HOME_IMAGE_PROMPT,
              imagePrompt: kind === 'fashion' ? FASHION_IMAGE_PROMPT : HOME_IMAGE_PROMPT,
              suggestions: (kind === 'fashion' ? FASHION_SUGGESTIONS : HOME_SUGGESTIONS).map((s) => ({
                description: s.visualDescription || s.name,
              })),
            });
          }}
        />
      )}
      {scene.kind === 'reveal' && <RevealScene key={sceneIdx} onDone={advance} />}
      {scene.kind === 'tagline' && <TaglineScene key={sceneIdx} onDone={restart} />}

      {visual && (
        <VisualModal
          kind={visual.kind}
          description={visual.description}
          items={visual.items}
          imagePrompt={visual.imagePrompt}
          pieces={visual.suggestions}
          onClose={() => setVisual(null)}
          onAdd={() => {}}
          lang="en"
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
        ↻ restart
      </button>
      <style jsx global>{`
        .oben-promo-restart:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
