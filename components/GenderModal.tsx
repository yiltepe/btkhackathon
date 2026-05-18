'use client';

import React from 'react';
import { t } from '@/lib/i18n';
import type { Gender, Lang } from '@/lib/types';
import LanguageToggle from './LanguageToggle';

type Props = {
  lang: Lang;
  current?: Gender | null;
  onSelect: (g: Gender) => void;
  onSkip?: () => void;
  onClose?: () => void;
  showSkip?: boolean;
  onLangChange?: (l: Lang) => void;
};

const OPTIONS: { value: Gender; labelKey: 'gender.men' | 'gender.women' | 'gender.unisex' }[] = [
  { value: 'women', labelKey: 'gender.women' },
  { value: 'men', labelKey: 'gender.men' },
  { value: 'unisex', labelKey: 'gender.unisex' },
];

export default function GenderModal({ lang, current, onSelect, onSkip, onClose, showSkip = true, onLangChange }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(17,17,17,.32)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-soft)',
          borderRadius: 6,
          padding: '36px 36px 28px',
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 20px 60px -30px rgba(0,0,0,.18)',
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--accent)',
                marginRight: 8,
                verticalAlign: 'middle',
                transform: 'translateY(-1px)',
              }}
            />
            OBEN
          </div>
          {onLangChange && <LanguageToggle lang={lang} onChange={onLangChange} />}
        </div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: '-.025em',
            lineHeight: 1.15,
            margin: '0 0 8px',
          }}
        >
          {t('gender.modal.title', lang)}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 22px', lineHeight: 1.45 }}>
          {t('gender.modal.sub', lang)}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OPTIONS.map((opt) => {
            const active = current === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSelect(opt.value)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                  borderRadius: 6,
                  background: active ? 'rgba(124,45,18,0.05)' : 'var(--bg-soft)',
                  fontSize: 14.5,
                  fontWeight: 500,
                  letterSpacing: '-.005em',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  transition: 'border-color .14s, background .14s',
                }}
                onMouseEnter={(ev) => {
                  if (!active) ev.currentTarget.style.borderColor = '#CFCBC0';
                }}
                onMouseLeave={(ev) => {
                  if (!active) ev.currentTarget.style.borderColor = 'var(--line)';
                }}
              >
                {t(opt.labelKey, lang)}
              </button>
            );
          })}
        </div>

        {showSkip && onSkip && (
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button
              onClick={onSkip}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                fontSize: 12.5,
                cursor: 'pointer',
                padding: 6,
              }}
            >
              {t('gender.skip', lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
