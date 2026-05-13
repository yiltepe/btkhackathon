'use client';

import React, { useState } from 'react';
import Overlay from './Overlay';
import Thumbnail from './Thumbnail';
import { Glyph } from './Icons';
import { formatPrice } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { Lang, Product } from '@/lib/types';

type Sort = 'price' | 'rating';

function Row({
  r,
  highlight,
  onAdd,
  lang,
}: {
  r: Product;
  highlight: boolean;
  onAdd: () => void;
  lang: Lang;
}) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);
  const initials = r.retailer.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr .7fr auto auto auto',
        alignItems: 'center',
        gap: 10,
        padding: '12px',
        borderRadius: 4,
        background: hov ? '#F6F5F1' : 'transparent',
        fontSize: 13.5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#F4F1EA',
            color: '#5C3F1E',
            display: 'grid',
            placeItems: 'center',
            fontSize: 10,
            fontWeight: 500,
            flex: '0 0 auto',
          }}
        >
          {initials}
        </span>
        <span
          style={{
            fontWeight: highlight ? 500 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {r.retailer}
        </span>
      </div>
      <span
        style={{
          textAlign: 'right',
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
          color: highlight && r.price !== null ? 'var(--accent)' : 'var(--ink)',
        }}
      >
        {r.price === null ? '—' : formatPrice(r.price, r.currency)}
      </span>
      <span
        style={{
          color: 'var(--muted)',
          paddingLeft: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12.5,
        }}
      >
        <Glyph icon="truck" size={13} />
        {r.price === null ? t('card.price.visitForPrice', lang) : '—'}
      </span>
      <a
        href={r.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          paddingLeft: 8,
          fontSize: 13,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {t('card.price.visit', lang)} <Glyph icon="arrowRight" size={13} />
      </a>
      <button
        onClick={() => {
          setAdded(true);
          onAdd();
          setTimeout(() => setAdded(false), 1200);
        }}
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          color: added ? 'var(--accent)' : 'var(--muted)',
          border: '1px solid ' + (hov ? 'var(--line)' : 'transparent'),
          background: hov ? '#FFFFFF' : 'transparent',
          display: 'grid',
          placeItems: 'center',
          transition: 'all .14s',
        }}
      >
        <Glyph icon={added ? 'check' : 'plus'} size={14} />
      </button>
    </div>
  );
}

export default function LinksModal({
  productName,
  retailers,
  onClose,
  onAdd,
  onAddAll,
  lang,
}: {
  productName: string;
  retailers: Product[];
  onClose: () => void;
  onAdd: (r: Product) => void;
  onAddAll: () => void;
  lang: Lang;
}) {
  const [sort, setSort] = useState<Sort>('price');
  const sorted = [...retailers].sort((a, b) => {
    if (sort === 'price') {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return a.price - b.price;
    }
    return 0;
  });

  return (
    <Overlay onClose={onClose}>
      <div
        style={{
          width: 580,
          maxWidth: '92vw',
          background: 'var(--bg-soft)',
          border: '1px solid var(--line)',
          borderRadius: 6,
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 22px 16px',
            borderBottom: '1px solid var(--line-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <Thumbnail src={retailers[0]?.thumbnail} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                marginBottom: 3,
                fontWeight: 500,
              }}
            >
              {t('modal.links.title', lang)}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: '-.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {productName}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close', lang)}
            style={{
              width: 30,
              height: 30,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--muted)',
              borderRadius: 4,
            }}
          >
            <Glyph icon="close" size={16} />
          </button>
        </div>

        <div style={{ padding: '10px 16px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'inline-flex', background: '#F4F1EA', borderRadius: 5, padding: 2 }}>
            {(['price', 'rating'] as Sort[]).map((k) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 4,
                  fontSize: 11.5,
                  fontWeight: 500,
                  background: sort === k ? '#FFFFFF' : 'transparent',
                  color: sort === k ? 'var(--ink)' : 'var(--muted)',
                  boxShadow: sort === k ? '0 1px 2px rgba(0,0,0,.04)' : 'none',
                  transition: 'all .12s',
                }}
              >
                {k === 'price' ? t('modal.links.sortPrice', lang) : t('modal.links.sortRating', lang)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '6px 10px', maxHeight: 360, overflowY: 'auto' }}>
          {sorted.map((r, i) => (
            <Row key={i} r={r} highlight={sort === 'price' && i === 0} onAdd={() => onAdd(r)} lang={lang} />
          ))}
        </div>

        <div
          style={{
            padding: '14px 22px 16px',
            borderTop: '1px solid var(--line-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {retailers.length} · {t('modal.links.lastChecked', lang)}
          </span>
          <button
            onClick={onAddAll}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ink)',
              display: 'inline-flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <Glyph icon="plus" size={14} />
            {t('modal.links.addAll', lang)}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
