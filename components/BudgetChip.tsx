'use client';

import React, { useEffect, useRef, useState } from 'react';
import { t } from '@/lib/i18n';
import { budgetIsSet, formatBudget } from '@/lib/prefs';
import type { Budget, Lang } from '@/lib/types';

type Props = {
  lang: Lang;
  budget: Budget;
  onChange: (b: Budget) => void;
};

const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

function presets(currency: string): { key: string; min: number | null; max: number | null }[] {
  const scale = currency === 'TRY' ? 50 : 1;
  return [
    { key: 'budget.preset.any', min: null, max: null },
    { key: 'budget.preset.low', min: null, max: 500 * scale },
    { key: 'budget.preset.mid', min: 500 * scale, max: 2000 * scale },
    { key: 'budget.preset.high', min: 2000 * scale, max: 5000 * scale },
    { key: 'budget.preset.luxury', min: 5000 * scale, max: null },
  ];
}

export default function BudgetChip({ lang, budget, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [minStr, setMinStr] = useState(budget.min?.toString() ?? '');
  const [maxStr, setMaxStr] = useState(budget.max?.toString() ?? '');
  const [currency, setCurrency] = useState(budget.currency);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinStr(budget.min?.toString() ?? '');
    setMaxStr(budget.max?.toString() ?? '');
    setCurrency(budget.currency);
  }, [budget, open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const applyPreset = (min: number | null, max: number | null) => {
    onChange({ min, max, currency });
    setOpen(false);
  };

  const save = () => {
    const min = minStr.trim() ? Number(minStr) : null;
    const max = maxStr.trim() ? Number(maxStr) : null;
    onChange({ min: Number.isFinite(min!) ? min : null, max: Number.isFinite(max!) ? max : null, currency });
    setOpen(false);
  };

  const clear = () => {
    onChange({ min: null, max: null, currency });
    setOpen(false);
  };

  const active = budgetIsSet(budget);

  return (
    <div style={{ position: 'relative' }} ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 11px',
          borderRadius: 999,
          border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
          background: active ? 'rgba(124,45,18,0.06)' : 'var(--pill)',
          color: active ? 'var(--accent)' : 'var(--ink)',
          fontSize: 12.5,
          fontWeight: 500,
          letterSpacing: '-.005em',
          cursor: 'pointer',
          transition: 'background .14s, border-color .14s',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        {t('budget.chip', lang)}: {formatBudget(budget)}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            background: 'var(--bg-soft)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: 14,
            width: 280,
            zIndex: 60,
            boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 20px 60px -30px rgba(0,0,0,.18)',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 500 }}>
            {t('budget.modal.title', lang)}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {presets(currency).map((p) => {
              const isActive = (p.min ?? null) === (budget.min ?? null) && (p.max ?? null) === (budget.max ?? null);
              return (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.min, p.max)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 999,
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
                    background: isActive ? 'rgba(124,45,18,0.06)' : 'var(--bg-soft)',
                    color: isActive ? 'var(--accent)' : 'var(--ink)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {t(p.key as never, lang)}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <label style={{ flex: 1, fontSize: 11, color: 'var(--muted)' }}>
              {t('budget.min', lang)}
              <input
                type="number"
                value={minStr}
                onChange={(e) => setMinStr(e.target.value)}
                placeholder="—"
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 4,
                  padding: '7px 9px',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  fontSize: 13,
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                }}
              />
            </label>
            <label style={{ flex: 1, fontSize: 11, color: 'var(--muted)' }}>
              {t('budget.max', lang)}
              <input
                type="number"
                value={maxStr}
                onChange={(e) => setMaxStr(e.target.value)}
                placeholder="—"
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 4,
                  padding: '7px 9px',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  fontSize: 13,
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                }}
              />
            </label>
          </div>

          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 12 }}>
            {t('budget.currency', lang)}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 4,
                padding: '7px 9px',
                border: '1px solid var(--line)',
                borderRadius: 6,
                fontSize: 13,
                background: 'var(--bg)',
                color: 'var(--ink)',
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={clear}
              style={{
                flex: 1,
                padding: '8px 10px',
                border: '1px solid var(--line)',
                borderRadius: 6,
                background: 'var(--bg-soft)',
                fontSize: 12.5,
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {t('budget.clear', lang)}
            </button>
            <button
              onClick={save}
              style={{
                flex: 1,
                padding: '8px 10px',
                border: '1px solid var(--accent)',
                borderRadius: 6,
                background: 'var(--accent)',
                color: '#FAFAF8',
                fontSize: 12.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {t('budget.save', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
