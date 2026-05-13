'use client';

import React, { useEffect, useState } from 'react';
import Thumbnail from './Thumbnail';
import { Glyph } from './Icons';
import { formatPrice } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { CartItem, Lang } from '@/lib/types';

function Line({
  item,
  onRemove,
  lang,
}: {
  item: CartItem;
  onRemove: () => void;
  lang: Lang;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr auto',
        gap: 14,
        alignItems: 'flex-start',
        padding: '14px 22px',
        borderBottom: '1px solid var(--line-soft)',
        background: hov ? '#FCFBF8' : 'transparent',
      }}
    >
      <Thumbnail src={item.thumbnail} size={56} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            letterSpacing: '-.005em',
            lineHeight: 1.3,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{item.retailer}</div>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 9,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              color: 'var(--ink)',
            }}
          >
            {t('cart.goToStore', lang)} <Glyph icon="arrowRight" size={11} />
          </a>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {formatPrice(item.price, item.currency ?? 'EUR')}
        </span>
        <button
          onClick={onRemove}
          title={t('common.close', lang)}
          style={{
            width: 22,
            height: 22,
            color: 'var(--muted-2)',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 3,
            opacity: hov ? 1 : 0.5,
            transition: 'opacity .12s',
          }}
        >
          <Glyph icon="close" size={13} />
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer({
  open,
  items,
  onClose,
  onRemove,
  onClear,
  lang,
}: {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  lang: Lang;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const total = items.reduce((s, i) => s + (i.price ?? 0), 0);
  const currency = items.find((i) => i.price !== null)?.currency ?? 'EUR';

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: 'rgba(20,18,16,.28)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .2s',
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '92vw',
          background: 'var(--bg-soft)',
          borderLeft: '1px solid var(--line)',
          zIndex: 91,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .26s cubic-bezier(.4,0,.2,1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '18px 22px 16px',
            borderBottom: '1px solid var(--line-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                marginBottom: 3,
                fontWeight: 500,
              }}
            >
              {t('cart.title', lang)}
            </div>
            <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-.01em' }}>
              {t('cart.heading', lang)} · {items.length}{' '}
              {items.length === 1 ? t('cart.item', lang) : t('cart.items', lang)}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close', lang)}
            style={{
              width: 32,
              height: 32,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--muted)',
              borderRadius: 4,
            }}
          >
            <Glyph icon="close" size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {items.length === 0 ? (
            <div style={{ padding: '56px 22px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{t('cart.empty.title', lang)}</div>
              <div style={{ fontSize: 12.5 }}>{t('cart.empty.body', lang)}</div>
            </div>
          ) : (
            items.map((it) => <Line key={it.id} item={it} onRemove={() => onRemove(it.id)} lang={lang} />)
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--line-soft)', padding: '14px 22px 12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                fontWeight: 500,
              }}
            >
              {t('cart.total', lang)}
            </span>
            <span style={{ fontSize: 20, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              {formatPrice(total, currency)}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>
            {t('cart.note', lang)}
          </div>
          <button
            onClick={onClear}
            disabled={!items.length}
            style={{
              fontSize: 11.5,
              color: 'var(--muted-2)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              opacity: items.length ? 1 : 0.4,
            }}
          >
            {t('cart.clear', lang)}
          </button>
        </div>
      </aside>
    </>
  );
}
