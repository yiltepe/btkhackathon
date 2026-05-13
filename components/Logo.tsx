import React from 'react';

export default function Logo({ size = 18 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: '.02em',
        color: 'var(--ink)',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '1.25px solid var(--ink)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        O
      </span>
      OBEN
    </span>
  );
}
