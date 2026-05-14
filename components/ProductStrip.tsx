'use client';

import React, { useState } from 'react';
import Thumbnail from './Thumbnail';
import { Glyph } from './Icons';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';

function Chip({ item, onAdd, onCompare }: { item: Product; onAdd: () => void; onCompare?: () => void }) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onCompare}
      style={{
        flex: '0 0 auto',
        width: 148,
        scrollSnapAlign: 'start',
        border: `1px solid ${hov ? '#D5D2C9' : 'var(--line)'}`,
        background: hov ? '#FFFFFF' : 'var(--bg)',
        borderRadius: 6,
        padding: 10,
        position: 'relative',
        transition: 'all .14s',
        cursor: onCompare ? 'pointer' : 'default',
      }}
    >
      <Thumbnail src={item.thumbnail} size={128} />
      <div
        style={{
          marginTop: 10,
          fontSize: 12.5,
          lineHeight: 1.35,
          fontWeight: 500,
          letterSpacing: '-.005em',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {item.name}
      </div>
      <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{item.retailer}</span>
        <span style={{ fontSize: 12.5, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {formatPrice(item.price, item.currency)}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setAdded(true);
          onAdd();
          setTimeout(() => setAdded(false), 1200);
        }}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1px solid var(--line)',
          color: added ? 'var(--accent)' : 'var(--ink)',
          display: 'grid',
          placeItems: 'center',
          opacity: hov || added ? 1 : 0,
          transition: 'opacity .15s',
        }}
      >
        <Glyph icon={added ? 'check' : 'plus'} size={12} />
      </button>
    </div>
  );
}

export default function ProductStrip({
  items,
  onAdd,
  onCompare,
}: {
  items: Product[];
  onAdd: (p: Product) => void;
  onCompare?: (p: Product) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '10px 16px 14px',
        overflowX: 'auto',
        scrollSnapType: 'x proximity',
      }}
    >
      {items.map((it, i) => (
        <Chip
          key={i}
          item={it}
          onAdd={() => onAdd(it)}
          onCompare={onCompare ? () => onCompare(it) : undefined}
        />
      ))}
    </div>
  );
}
