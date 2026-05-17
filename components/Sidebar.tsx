'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Glyph } from './Icons';
import { t } from '@/lib/i18n';
import type { Chat, Lang } from '@/lib/types';
import { useClerk, useUser } from '@clerk/nextjs';

export default function Sidebar({
  chats,
  activeId,
  onSelect,
  onNew,
  onDelete,
  cartCount,
  onOpenCart,
  lang,
  className,
}: {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  lang: Lang;
  className?: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const displayName =
    user?.username ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    t('account.guest', lang);

  const initial = (displayName[0] || '?').toUpperCase();

  return (
    <aside
      className={className}
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
          <div
            key={c.id}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredId(c.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => onSelect(c.id)}
              className="oben-history-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '7px 10px',
                paddingRight: 30,
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
            {hoveredId === c.id && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                title={t('chat.delete', lang)}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 3,
                  color: 'var(--muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
                onMouseEnter={(ev) => { ev.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={(ev) => { ev.currentTarget.style.color = 'var(--muted)'; }}
              >
                <Glyph icon="close" size={11} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--line-soft)', padding: '10px 12px 6px' }}>
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

      <div ref={menuRef} style={{ position: 'relative', borderTop: '1px solid var(--line-soft)', padding: '8px 12px 14px' }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="oben-history-item"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 5,
            color: 'var(--ink)',
            background: menuOpen ? '#F4F1EA' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#FAFAF8',
              fontSize: 11,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {initial}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {displayName}
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)', transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform .14s' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% - 2px)',
              left: 12,
              right: 12,
              background: 'var(--bg-soft)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 20px 60px -30px rgba(0,0,0,.18)',
              padding: 6,
              zIndex: 50,
            }}
          >
            <button
              onClick={() => { setMenuOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 4,
                color: 'var(--accent)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,45,18,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Glyph icon="star" size={13} />
              {t('account.upgrade', lang)}
            </button>
            <button
              onClick={() => { setMenuOpen(false); signOut({ redirectUrl: '/' }); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                fontSize: 13,
                fontWeight: 400,
                borderRadius: 4,
                color: 'var(--ink)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F4F1EA'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {t('account.signOut', lang)}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
