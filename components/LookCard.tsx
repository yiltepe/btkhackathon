'use client';

import React from 'react';
import ProductStrip from './ProductStrip';
import { Glyph } from './Icons';
import { formatPrice } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { Lang, Product } from '@/lib/types';

export default function LookCard({
  variant,
  items,
  hasVisual,
  suggestions,
  onAdd,
  onOpenModal,
  onCompare,
  lang,
}: {
  variant: 'fashion' | 'home';
  items: Product[];
  hasVisual?: boolean;
  suggestions?: { name: string; visualDescription?: string }[];
  onAdd: (p: Product) => void;
  onOpenModal: () => void;
  onCompare?: (p: Product) => void;
  lang: Lang;
}) {
  const titleKey = variant === 'fashion' ? 'card.fashion.title' : 'card.home.title';
  const planKey = variant === 'fashion' ? 'card.fashion.plan' : 'card.home.plan';
  const genKey = variant === 'fashion' ? 'card.fashion.generateVisual' : 'card.home.generateVisual';
  const viewKey = variant === 'fashion' ? 'card.fashion.view' : 'card.home.view';
  const total = items.reduce((s, i) => s + (i.price ?? 0), 0);
  const currency = items.find((i) => i.price !== null)?.currency ?? 'EUR';
  const planPieces = suggestions?.filter((s) => s.name).slice(0, 6) ?? [];

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
      <ProductStrip items={items} onAdd={onAdd} onCompare={onCompare} />

      {hasVisual && planPieces.length > 0 && (
        <div
          style={{
            padding: '10px 16px 12px',
            borderTop: '1px solid var(--line-soft)',
            background: '#FAFAF7',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--muted-2)',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            {t(planKey, lang)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {planPieces.map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11.5,
                  color: 'var(--muted)',
                  background: 'var(--pill)',
                  borderRadius: 4,
                  padding: '3px 8px',
                  lineHeight: 1.4,
                }}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          padding: '10px 16px 14px',
          borderTop: '1px solid var(--line-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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

        {hasVisual && (
          <button
            onClick={onOpenModal}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#FFFFFF',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 5,
              padding: '6px 12px',
              display: 'inline-flex',
              gap: 5,
              alignItems: 'center',
              cursor: 'pointer',
              letterSpacing: '-.005em',
              transition: 'background .14s',
            }}
            onMouseEnter={(ev) => { ev.currentTarget.style.background = '#5A1F0C'; }}
            onMouseLeave={(ev) => { ev.currentTarget.style.background = 'var(--accent)'; }}
          >
            <Glyph icon="image" size={13} />
            {t(genKey, lang)}
          </button>
        )}
      </div>
    </div>
  );
}
