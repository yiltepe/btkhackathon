'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Glyph } from './Icons';
import { t } from '@/lib/i18n';
import type { Chat, Lang } from '@/lib/types';

export default function Sidebar({
  chats,
  activeId,
  onSelect,
  onNew,
  cartCount,
  onOpenCart,
  lang,
}: {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  cartCount: number;
  onOpenCart: () => void;
  lang: Lang;
}) {
  return (
    <aside
      style={{
        width: 240,
        flex: '0 0 240px',
        background: 'var(--bg-soft)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ padding: '20px 20px 14px' }}>
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <div style={{ padding: '4px 12px 6px' }}>
        <button
          onClick={onNew}
          className="oben-history-item"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 5,
            color: 'var(--ink)',
          }}
        >
          <Glyph icon="pen" size={14} />
          {t('chat.newChat', lang)}
        </button>
      </div>

      <div style={{ height: 1, background: 'var(--line-soft)', margin: '8px 16px 4px' }} />

      <div
        style={{
          padding: '10px 18px 4px',
          fontSize: 10.5,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '.1em',
          fontWeight: 500,
        }}
      >
        {t('chat.recent', lang)}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '2px 8px' }}>
        {chats.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="oben-history-item"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: 4,
              fontSize: 12.5,
              color: activeId === c.id ? 'var(--ink)' : 'var(--muted)',
              background: activeId === c.id ? '#F4F1EA' : 'transparent',
              fontWeight: activeId === c.id ? 500 : 400,
              textAlign: 'left',
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {c.title}
            </span>
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--line-soft)', padding: '10px 12px 14px' }}>
        <button
          onClick={onOpenCart}
          className="oben-history-item"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 5,
            color: 'var(--ink)',
          }}
        >
          <Glyph icon="cart" size={15} />
          {t('chat.cart', lang)}
          {cartCount > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                padding: '0 6px',
                background: 'var(--accent)',
                color: '#FAFAF8',
                fontSize: 11,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
