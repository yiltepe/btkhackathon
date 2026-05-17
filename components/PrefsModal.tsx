'use client';

import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

type Props = {
  lang: Lang;
  initial?: string;
  onSave: (prefs: string) => void;
  onSkip?: () => void;
  onClose?: () => void;
};

export default function PrefsModal({ lang, initial = '', onSave, onSkip, onClose }: Props) {
  const [value, setValue] = useState(initial);

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
        <div
          style={{
            fontSize: 11,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 14,
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
        <h2
          style={{
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: '-.025em',
            lineHeight: 1.15,
            margin: '0 0 8px',
          }}
        >
          {t('prefs.modal.title', lang)}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 22px', lineHeight: 1.45 }}>
          {t('prefs.modal.sub', lang)}
        </p>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('prefs.placeholder', lang)}
          maxLength={200}
          rows={4}
          style={{
            width: '100%',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '12px 14px',
            fontSize: 14,
            fontFamily: 'inherit',
            color: 'var(--ink)',
            background: 'var(--bg-soft)',
            resize: 'vertical',
            outline: 'none',
            letterSpacing: '-.005em',
            lineHeight: 1.5,
          }}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => onSave(value.trim())}
            disabled={!value.trim()}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--accent)',
              borderRadius: 6,
              background: value.trim() ? 'var(--accent)' : 'var(--pill)',
              color: value.trim() ? '#FAFAF8' : 'var(--muted)',
              fontSize: 14,
              fontWeight: 500,
              cursor: value.trim() ? 'pointer' : 'not-allowed',
              transition: 'background .14s',
            }}
          >
            {t('prefs.save', lang)}
          </button>
        </div>

        {onSkip && (
          <div style={{ marginTop: 14, textAlign: 'center' }}>
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
              {t('prefs.skip', lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
