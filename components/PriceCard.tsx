'use client';

import React, { useState } from 'react';
import Thumbnail from './Thumbnail';
import { Glyph } from './Icons';
import { formatPrice } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { Lang, Product } from '@/lib/types';

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
        gridTemplateColumns: '1.3fr .9fr 1.2fr auto auto',
        padding: '10px 10px',
        alignItems: 'center',
        fontSize: 13.5,
        borderRadius: 4,
        background: hov ? '#F6F5F1' : 'transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span
          style={{
            width: 22,
            height: 22,
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
      <span style={{ color: 'var(--muted)', paddingLeft: 18, fontSize: 12.5 }}>
        {r.price === null ? t('card.price.visitForPrice', lang) : ''}
      </span>
      <a
        href={r.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          paddingLeft: 14,
          color: 'var(--ink)',
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
        title={t('common.add', lang)}
        style={{
          width: 26,
          height: 26,
          borderRadius: 4,
          display: 'grid',
          placeItems: 'center',
          color: added ? 'var(--accent)' : 'var(--muted)',
          background: hov ? '#FFFFFF' : 'transparent',
          border: '1px solid ' + (hov ? 'var(--line)' : 'transparent'),
          transition: 'all .14s',
        }}
      >
        <Glyph icon={added ? 'check' : 'plus'} size={14} />
      </button>
    </div>
  );
}

export default function PriceCard({
  productName,
  retailers,
  onAdd,
  onOpenModal,
  lang,
}: {
  productName?: string;
  retailers: Product[];
  onAdd: (r: Product) => void;
  onOpenModal: () => void;
  lang: Lang;
}) {
  if (retailers.length === 0) return null;
  const lowest = retailers.find((r) => r.price !== null) ?? retailers[0];
  return (
    <div
      style={{
        border: '1px solid var(--line)',
        background: 'var(--bg-soft)',
        borderRadius: 6,
        marginTop: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--line-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--muted)',
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        <span>
          {t('card.price.title', lang)} · {retailers.length} {t('card.price.retailers', lang)}
        </span>
        <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
          {t('card.price.sorted', lang)}
        </span>
      </div>
      {productName && (
        <div
          style={{
            display: 'flex',
            gap: 14,
            padding: '14px 16px',
            alignItems: 'center',
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          <Thumbnail src={lowest.thumbnail} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 3,
                letterSpacing: '-.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {productName}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                marginBottom: 2,
              }}
            >
              {t('card.price.lowest', lang)}
            </div>
            <div style={{ fontSize: 18, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              {formatPrice(lowest.price, lowest.currency)}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '4px 6px 8px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr .9fr 1.2fr auto auto',
            padding: '8px 10px 6px',
            fontSize: 11,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            fontWeight: 500,
          }}
        >
          <span>{t('card.price.retailer', lang)}</span>
          <span style={{ textAlign: 'right' }}>{t('card.price.price', lang)}</span>
          <span style={{ paddingLeft: 18 }}>{t('card.price.delivery', lang)}</span>
          <span style={{ paddingLeft: 14 }}>{t('card.price.visit', lang)}</span>
          <span style={{ width: 28 }} />
        </div>
        {retailers.slice(0, 4).map((r, i) => (
          <Row key={i} r={r} highlight={i === 0} onAdd={() => onAdd(r)} lang={lang} />
        ))}
      </div>

      {retailers.length > 4 && (
        <div
          style={{
            padding: '10px 16px 14px',
            borderTop: '1px solid var(--line-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            + {retailers.length - 4} {t('card.price.more', lang)}
          </span>
          <button
            onClick={onOpenModal}
            style={{
              fontSize: 13,
              color: 'var(--ink)',
              fontWeight: 500,
              display: 'inline-flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            {t('card.price.seeAll', lang)} <Glyph icon="arrowRight" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
