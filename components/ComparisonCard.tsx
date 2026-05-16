'use client';

import React from 'react';
import type { Comparison, Lang } from '@/lib/types';
import { t } from '@/lib/i18n';

export default function ComparisonCard({ comparison, lang }: { comparison: Comparison; lang: Lang }) {
  if (!comparison?.items?.length) return null;
  const winnerName = comparison.winner;
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '.12em',
          fontWeight: 500,
          marginBottom: 10,
        }}
      >
        {t('compare.heading', lang)}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(comparison.items.length, 3)}, minmax(0, 1fr))`,
          gap: 10,
        }}
      >
        {comparison.items.map((it, i) => {
          const isWinner = !!winnerName && it.name.trim().toLowerCase() === winnerName.trim().toLowerCase();
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                background: 'var(--bg-soft)',
                border: `1px solid ${isWinner ? 'var(--accent)' : 'var(--line)'}`,
                borderRadius: 6,
                padding: '12px 12px 14px',
                boxShadow: 'var(--shadow)',
              }}
            >
              {isWinner && (
                <div
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: 10,
                    background: 'var(--accent)',
                    color: '#FAFAF8',
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    padding: '2px 7px',
                    borderRadius: 3,
                  }}
                >
                  {t('compare.winner', lang)}
                </div>
              )}
              <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4, letterSpacing: '-.005em' }}>
                {it.name}
              </div>
              {it.bestFor && (
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 8 }}>
                  {t('compare.bestFor', lang)}: {it.bestFor}
                </div>
              )}
              <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.45, marginBottom: 8 }}>
                {it.summary}
              </div>
              {it.pros && it.pros.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>
                    {t('compare.pros', lang)}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--ink)', lineHeight: 1.45 }}>
                    {it.pros.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {it.cons && it.cons.length > 0 && (
                <div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>
                    {t('compare.cons', lang)}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--ink)', lineHeight: 1.45 }}>
                    {it.cons.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {comparison.verdict && (
        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            color: 'var(--ink)',
            background: 'var(--pill)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '10px 12px',
            lineHeight: 1.5,
          }}
        >
          {comparison.verdict}
        </div>
      )}
    </div>
  );
}
