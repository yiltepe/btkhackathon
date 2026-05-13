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
        height: 200,
        width: isHanger ? 150 : 170,
        background: '#FFFFFF',
        border: '1px solid var(--line-soft)',
        borderRadius: 4,
        boxShadow: 'var(--shadow-item)',
        padding: isHanger ? '8px 18px 16px' : 18,
        position: 'relative',
        display: 'flex',
        flexDirection: isHanger ? 'column' : 'row',
        alignItems: isHanger ? 'stretch' : 'center',
        justifyContent: isHanger ? 'flex-start' : 'center',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          fontSize: 9,
          letterSpacing: '.12em',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {item.tag}
      </span>
      {isHanger && (
        <div
          style={{
            height: 8,
            borderBottom: '1px solid #D8D6D1',
            marginBottom: -4,
            position: 'relative',
          }}
        >
          <span
            style={{
              content: '',
              position: 'absolute',
              left: '50%',
              top: -7,
              width: 10,
              height: 5,
              border: '1px solid #C9C5BD',
              borderBottom: 0,
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              transform: 'translateX(-50%)',
              display: 'block',
            }}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: isHanger ? 'stretch' : 'center',
          justifyContent: 'center',
          marginTop: isHanger ? 6 : 0,
          width: '100%',
        }}
      >
        {item.body}
      </div>
      <span
        style={{
          position: 'absolute',
          bottom: 10,
          right: 12,
          fontSize: 10,
          color: 'var(--muted)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {item.price}
      </span>
    </div>
  );
}

export default function Vitrine() {
  const rows = useMemo(() => {
    const fashion = ITEMS.filter((i) => i.kind === 'hanger');
    const objects = ITEMS.filter((i) => i.kind === 'square');
    return ROW_CONFIG.map((cfg) => {
      let pool: VitrineItem[];
      if (cfg.pick === 'fashion') pool = fashion;
      else if (cfg.pick === 'objects') pool = objects;
      else pool = seededShuffle(fashion, cfg.seed).concat(seededShuffle(objects, cfg.seed + 1).slice(0, 4));
      const shuffled = seededShuffle(pool, cfg.seed + 7);
      const doubled = shuffled.concat(shuffled);
      return { ...cfg, items: doubled };
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
