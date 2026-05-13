'use client';

import React from 'react';
import { t } from '@/lib/i18n';
import type { Lang, Mode } from '@/lib/types';

const MODES: Mode[] = ['auto', 'price', 'fashion', 'home', 'electronics', 'beauty'];

export default function ModeSelector({
  mode,
  setMode,
  lang,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  lang: Lang;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {MODES.map((m) => {
        const active = m === mode;
        return (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '5px 11px',
              borderRadius: 4,
              fontSize: 12.5,
              fontWeight: active ? 500 : 400,
              color: active ? '#FAFAF8' : 'var(--muted)',
              background: active ? 'var(--accent)' : 'transparent',
              letterSpacing: '.005em',
              transition: 'all .14s',
            }}
          >
            {t(`mode.${m}` as never, lang)}
          </button>
        );
      })}
    </div>
  );
}
