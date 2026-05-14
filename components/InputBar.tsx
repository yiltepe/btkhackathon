'use client';

import React, { useEffect, useRef } from 'react';
import { Glyph } from './Icons';
import ModeSelector from './ModeSelector';
import BudgetChip from './BudgetChip';
import { t } from '@/lib/i18n';
import type { Budget, Lang, Mode } from '@/lib/types';

export default function InputBar({
  mode,
  setMode,
  value,
  setValue,
  onSend,
  onAttach,
  onClearFile,
  pendingFilePreview,
  lang,
  resolving,
  budget,
  onBudgetChange,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  onAttach: (file: File) => void;
  onClearFile?: () => void;
  pendingFilePreview?: string;
  lang: Lang;
  resolving?: boolean;
  budget: Budget;
  onBudgetChange: (b: Budget) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [value]);

  return (
    <div style={{ padding: '12px 28px 18px', background: 'var(--bg)' }}>
      <div
        style={{
          maxWidth: 780,
          margin: '0 auto',
          background: 'var(--bg-soft)',
          border: '1px solid var(--line)',
          borderRadius: 6,
          boxShadow: 'var(--shadow)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 10px 4px',
            borderBottom: '1px dashed var(--line-soft)',
          }}
        >
          <ModeSelector mode={mode} setMode={setMode} lang={lang} />
          <div style={{ flex: 1 }} />
          <div style={{ paddingRight: 8 }}>
            <BudgetChip lang={lang} budget={budget} onChange={onBudgetChange} />
          </div>
          <span
            style={{
              fontSize: 11,
              color: 'var(--muted-2)',
              letterSpacing: '.04em',
              paddingRight: 6,
              fontWeight: 500,
            }}
          >
            {t('chat.input.hint', lang)}
          </span>
        </div>

        {pendingFilePreview && (
          <div style={{ padding: '8px 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingFilePreview}
              alt=""
              style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--line)' }}
            />
            <button
              onClick={onClearFile}
              title="Remove"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--muted-2)',
                color: '#fff',
                fontSize: 12,
                display: 'grid',
                placeItems: 'center',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 12px' }}>
          <textarea
            ref={taRef}
            className="oben-input"
            placeholder={resolving ? t('chat.fetchingProduct', lang) : t('chat.input.placeholder', lang)}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              padding: '8px 6px',
              fontSize: 14.5,
              lineHeight: 1.5,
              color: 'var(--ink)',
              minHeight: 36,
              maxHeight: 140,
              letterSpacing: '-.005em',
              outline: 'none',
              background: 'transparent',
              border: 0,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 2 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onAttach(f);
                e.currentTarget.value = '';
              }}
            />
            <button
              title={t('chat.attach', lang)}
              onClick={() => fileRef.current?.click()}
              className="oben-history-item"
              style={{
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--muted)',
                borderRadius: 4,
              }}
            >
              <Glyph icon="paperclip" size={16} />
            </button>
            <button
              title={t('chat.send', lang)}
              onClick={onSend}
              disabled={(!value.trim() && !pendingFilePreview) || !!resolving}
              style={{
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 4,
                background: (value.trim() || pendingFilePreview) && !resolving ? 'var(--accent)' : '#E5E5E5',
                color: (value.trim() || pendingFilePreview) && !resolving ? '#FAFAF8' : '#9A9A93',
                transition: 'background .14s',
              }}
            >
              <Glyph icon="arrowUp" size={15} />
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          maxWidth: 780,
          margin: '8px auto 0',
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--muted-2)',
          letterSpacing: '.01em',
        }}
      >
        {t('chat.disclaimer', lang)}
      </div>
    </div>
  );
}
