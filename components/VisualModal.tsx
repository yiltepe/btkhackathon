'use client';

import React, { useEffect, useRef, useState } from 'react';
import Overlay from './Overlay';
import Thumbnail from './Thumbnail';
import { Glyph } from './Icons';
import { formatPrice } from '@/lib/format';
import { t } from '@/lib/i18n';
import { sha1, getCached, setCached } from '@/lib/cache';
import type { Lang, Product } from '@/lib/types';

function VisualChip({
  item,
  onAdd,
  lang,
}: {
  item: Product;
  onAdd: () => void;
  lang: Lang;
}) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '0 0 auto',
        width: 172,
        border: `1px solid ${hov ? '#D5D2C9' : 'var(--line)'}`,
        background: hov ? '#FFFFFF' : 'var(--bg)',
        borderRadius: 6,
        padding: 11,
        position: 'relative',
        transition: 'all .14s',
      }}
    >
      <Thumbnail src={item.thumbnail} size={150} />
      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          lineHeight: 1.35,
          fontWeight: 500,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {item.name}
      </div>
      <div style={{ marginTop: 3, fontSize: 11.5, color: 'var(--muted)' }}>{item.retailer}</div>
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11.5,
            color: 'var(--muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {t('modal.visual.findSimilar', lang)} <Glyph icon="arrowRight" size={11} />
        </a>
        <span style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {formatPrice(item.price, item.currency)}
        </span>
      </div>
      <button
        onClick={() => {
          setAdded(true);
          onAdd();
          setTimeout(() => setAdded(false), 1200);
        }}
        style={{
          position: 'absolute',
          top: 9,
          right: 9,
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: '1px solid var(--line)',
          background: '#FFFFFF',
          color: added ? 'var(--accent)' : 'var(--ink)',
          display: 'grid',
          placeItems: 'center',
          opacity: hov || added ? 1 : 0,
          transition: 'opacity .15s',
        }}
      >
        <Glyph icon={added ? 'check' : 'plus'} size={13} />
      </button>
    </div>
  );
}

export default function VisualModal({
  kind,
  description,
  items,
  imagePrompt,
  onClose,
  onAdd,
  lang,
}: {
  kind: 'fashion' | 'home';
  description: string;
  items: Product[];
  imagePrompt?: string;
  onClose: () => void;
  onAdd: (p: Product) => void;
  lang: Lang;
}) {
  const isFashion = kind === 'fashion';
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    (async () => {
      const prompt = imagePrompt || description;
      const hash = await sha1(prompt);
      const cached = getCached(hash);
      if (cached) {
        setImage(cached);
        setLoading(false);
        return;
      }
      const start = Date.now();
      const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: kind, items: items.map((i) => i.name) }),
        });
        const data = (await res.json()) as { imageBase64?: string; mock?: boolean };
        if (cancelled) return;
        if (data.imageBase64) {
          setImage(data.imageBase64);
          setCached(hash, data.imageBase64);
        }
      } catch {
        /* ignore */
      } finally {
        window.clearInterval(timer);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imagePrompt, description, items, kind]);

  return (
    <Overlay onClose={onClose}>
      <div
        style={{
          width: 880,
          maxWidth: '94vw',
          background: 'var(--bg-soft)',
          border: '1px solid var(--line)',
          borderRadius: 6,
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              fontWeight: 500,
              pointerEvents: 'auto',
            }}
          >
            {isFashion ? t('modal.visual.fashionTitle', lang) : t('modal.visual.homeTitle', lang)}
          </div>
          <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
            <button
              onClick={onClose}
              title={t('common.close', lang)}
              style={{
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--muted)',
                borderRadius: 4,
              }}
            >
              <Glyph icon="close" size={15} />
            </button>
          </div>
        </div>

        <div
          style={{
            background: '#EFEAE0',
            padding: '72px 60px 56px',
            display: 'grid',
            placeItems: 'center',
            borderBottom: '1px solid var(--line-soft)',
            minHeight: 360,
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${image}`}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: 480,
                borderRadius: 4,
                boxShadow: '0 12px 30px -20px rgba(60,40,20,.18)',
              }}
            />
          ) : (
            <div
              style={{
                width: isFashion ? 380 : 560,
                maxWidth: '100%',
                aspectRatio: isFashion ? '3/4' : '4/3',
                background: '#FBF7EF',
                border: '1px solid #E3DCC9',
                borderRadius: 4,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--muted)',
                fontSize: 12,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {loading ? (
                <span>
                  {isFashion ? t('modal.visual.generating', lang) : t('modal.visual.generatingRoom', lang)} · {elapsed}s
                </span>
              ) : (
                <span>—</span>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 16px 18px' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              fontWeight: 500,
              padding: '4px 4px 10px',
            }}
          >
            {isFashion ? t('modal.visual.pieces', lang) : t('modal.visual.piecesRoom', lang)} — {items.length}
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
            {items.map((it, i) => (
              <VisualChip key={i} item={it} onAdd={() => onAdd(it)} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </Overlay>
  );
}
