'use client';

import React from 'react';
import type { Lang } from '@/lib/types';
import { LANG_STORAGE_KEY } from '@/lib/i18n';

export default function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  const setLang = (l: Lang) => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch { /* ignore */ }
    onChange(l);
  };
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--pill)',
        borderRadius: 5,
        padding: 2,
      }}
    >
      {(['en', 'tr'] as Lang[]).map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 11.5,
              fontWeight: 500,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              background: active ? '#FFFFFF' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--muted)',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,.04)' : 'none',
              transition: 'all .12s',
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
