'use client';

import React, { useMemo } from 'react';
import { ITEMS, type VitrineItem } from './ItemSvgs';

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ROW_CONFIG: Array<{ dir: 'l' | 'r'; speed: string; seed: number; pick: 'fashion' | 'mixed' | 'objects' }> = [
  { dir: 'l', speed: 's1', seed: 11, pick: 'mixed' },
  { dir: 'r', speed: 's2', seed: 27, pick: 'mixed' },
  { dir: 'l', speed: 's3', seed: 43, pick: 'fashion' },
  { dir: 'r', speed: 's4', seed: 61, pick: 'mixed' },
  { dir: 'l', speed: 's5', seed: 89, pick: 'mixed' },
];

function Item({ item }: { item: VitrineItem }) {
  const isHanger = item.kind === 'hanger';
  return (
    <div
      style={{
        flex: '0 0 auto',
        height: 280,
        width: 280,
        background: '#FFFFFF',
        border: '1px solid var(--line-soft)',
        borderRadius: 4,
        boxShadow: 'var(--shadow-item)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.body}
      </div>
      <span
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          fontSize: 10,
          letterSpacing: '.14em',
          color: 'var(--ink)',
          textTransform: 'uppercase',
          fontWeight: 500,
          zIndex: 1,
          mixBlendMode: 'multiply',
        }}
      >
        {item.tag}
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: 12,
          right: 14,
          fontSize: 12,
          color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 500,
          zIndex: 1,
          mixBlendMode: 'multiply',
        }}
      >
        {item.price}
      </span>
    </div>
  );
}

export default function Vitrine() {
  const rows = useMemo(() => {
    const deAdjacent = (arr: VitrineItem[]) => {
      const out = arr.slice();
      for (let i = 1; i < out.length; i++) {
        if (out[i].tag === out[i - 1].tag) {
          for (let j = i + 1; j < out.length; j++) {
            if (out[j].tag !== out[i - 1].tag && (i + 1 >= out.length || out[j].tag !== out[i + 1]?.tag)) {
              [out[i], out[j]] = [out[j], out[i]];
              break;
            }
          }
        }
      }
      return out;
    };
    return ROW_CONFIG.map((cfg) => {
      const shuffled = deAdjacent(seededShuffle(ITEMS, cfg.seed + 7));
      return { ...cfg, items: shuffled.concat(shuffled) };
    });
  }, []);

  return (
    <div
      aria-hidden
      className="vitrine-mask"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 28,
        padding: '80px 0',
        overflow: 'hidden',
      }}
    >
      {rows.map((row, i) => (
        <div key={i} className={`vitrine-row ${row.dir} ${row.speed}`}>
          {row.items.map((it, j) => (
            <Item key={`${it.id}-${j}`} item={it} />
          ))}
        </div>
      ))}
    </div>
  );
}
