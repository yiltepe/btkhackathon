import React from 'react';

export default function Thumbnail({
  src,
  size = 56,
  alt,
}: {
  src?: string;
  size?: number;
  alt?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#F4F1EA',
        borderRadius: 4,
        border: '1px solid #EDEDEA',
        overflow: 'hidden',
        flex: '0 0 auto',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      ) : (
        <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="#B5B1A8" strokeWidth="1.4">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M3 17l5-4 4 3 3-2 6 5" />
        </svg>
      )}
    </div>
  );
}
