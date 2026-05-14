'use client';

import React from 'react';
import ProductStrip from './ProductStrip';
import { Glyph } from './Icons';
import { formatPrice } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { Lang, Product } from '@/lib/types';

export default function LookCard({
  variant,
  description,
  items,
  onAdd,
  onOpenModal,
  onCompare,
  lang,
}: {
  variant: 'fashion' | 'home';
  description: string;
  items: Product[];
  onAdd: (p: Product) => void;
  onOpenModal: () => void;
  onCompare?: (p: Product) => void;
  lang: Lang;
}) {
  const titleKey = variant === 'fashion' ? 'card.fashion.title' : 'card.home.title';
  const viewKey = variant === 'fashion' ? 'card.fashion.view' : 'card.home.view';
  const total = items.reduce((s, i) => s + (i.price ?? 0), 0);
  const currency = items.find((i) => i.price !== null)?.currency ?? 'EUR';

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
        <span>{t(titleKey, lang)}</span>
        <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
          {items.length} {t('card.fashion.pieces', lang)} · {formatPrice(total, currency)} {t('card.fashion.total', lang)}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          padding: '14px 16px 6px',
          fontSize: 14.5,
          lineHeight: 1.55,
          color: 'var(--ink)',
          letterSpacing: '-.005em',
        }}
      >
        {description}
      </p>

      <ProductStrip items={items} onAdd={onAdd} onCompare={onCompare} />

      <div style={{ padding: '8px 16px 14px', borderTop: '1px solid var(--line-soft)' }}>
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
          {t(viewKey, lang)} <Glyph icon="arrowRight" size={14} />
        </button>
      </div>
    </div>
  );
}
