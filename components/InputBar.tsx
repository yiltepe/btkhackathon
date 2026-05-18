'use client';

import React, { useEffect, useRef } from 'react';
import { Glyph } from './Icons';
import BudgetChip from './BudgetChip';
import { t } from '@/lib/i18n';
import type { Budget, Lang } from '@/lib/types';

export default function InputBar({
  value,
  setValue,
  onSend,
  onAttach,
  onClearFile,
  pendingFilePreviews,
  lang,
  resolving,
  budget,
  onBudgetChange,
  attachLimitNote,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  onAttach: (file: File) => void;
  onClearFile?: (index?: number) => void;
  pendingFilePreviews?: string[];
  lang: Lang;
  resolving?: boolean;
  budget: Budget;
  onBudgetChange: (b: Budget) => void;
  attachLimitNote?: string;
}) {
  const hasPreviews = !!pendingFilePreviews && pendingFilePreviews.length > 0;
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [value]);

  return (
    <div className="oben-input-bar" style={{ padding: '12px 28px 18px', background: 'var(--bg)' }}>
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
        {hasPreviews && (
          <div style={{ padding: '8px 12px 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {pendingFilePreviews!.map((src, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--line)', display: 'block' }}
                />
                <button
                  onClick={() => onClearFile?.(i)}
                  title="Remove"
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'var(--muted-2)',
                    color: '#fff',
                    fontSize: 11,
                    display: 'grid',
                    placeItems: 'center',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {attachLimitNote && (
          <div style={{ padding: '4px 12px 0', fontSize: 11.5, color: 'var(--accent)', letterSpacing: '-.005em' }}>
            {attachLimitNote}
          </div>
        )}
        <div className="oben-input-row" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 12px' }}>
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
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (!items) return;
              for (let i = 0; i < items.length; i++) {
                const it = items[i];
                if (it.kind === 'file' && it.type.startsWith('image/')) {
                  const file = it.getAsFile();
                  if (file) {
                    e.preventDefault();
                    onAttach(file);
                    return;
                  }
                }
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
          <div className="oben-input-controls" style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 2 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                const list = e.target.files;
                if (list) {
                  for (let i = 0; i < list.length; i++) onAttach(list[i]);
                }
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
            <BudgetChip lang={lang} budget={budget} onChange={onBudgetChange} />
            <button
              className="oben-input-send"
              title={t('chat.send', lang)}
              onClick={onSend}
              disabled={(!value.trim() && !hasPreviews) || !!resolving}
              style={{
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 4,
                background: (value.trim() || hasPreviews) && !resolving ? 'var(--accent)' : '#E5E5E5',
                color: (value.trim() || hasPreviews) && !resolving ? '#FAFAF8' : '#9A9A93',
                transition: 'background .14s',
              }}
            >
              <Glyph icon="arrowUp" size={15} />
            </button>
          </div>
        </div>
      </div>
      <div
        className="oben-input-disclaimer"
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
