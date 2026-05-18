import React from 'react';

const P = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const Icon = {
  plus: <svg {...P}><path d="M12 5v14M5 12h14" /></svg>,
  arrowRight: <svg {...P}><path d="M5 12h14M13 5l7 7-7 7" /></svg>,
  arrowUp: <svg {...P}><path d="M12 19V5M5 12l7-7 7 7" /></svg>,
  paperclip: <svg {...P}><path d="M21 11.5l-9.2 9.2a5 5 0 1 1-7.07-7.07l9.19-9.2a3.5 3.5 0 0 1 4.95 4.95l-9.19 9.2a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>,
  cart: <svg {...P}><path d="M3 5h2.4L7 16.5a2 2 0 0 0 2 1.7h8.6a2 2 0 0 0 2-1.5L21 8H6" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg>,
  pen: <svg {...P}><path d="M16 3l5 5L8 21H3v-5L16 3z" /></svg>,
  close: <svg {...P}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  download: <svg {...P}><path d="M12 4v12M6 10l6 6 6-6M5 20h14" /></svg>,
  check: <svg {...P}><path d="M5 12l4 4L19 6" /></svg>,
  truck: <svg {...P}><rect x="1" y="6" width="14" height="11" rx="1" /><path d="M15 9h4l3 4v4h-7" /><circle cx="6" cy="18" r="1.5" /><circle cx="18" cy="18" r="1.5" /></svg>,
  star: <svg {...P}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.1l-5.4 2.8 1-6.1L3.2 9.5l6.1-.9z" /></svg>,
  external: <svg {...P}><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>,
  image: <svg {...P}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
};

export function Glyph({
  icon,
  size = 16,
  className,
}: {
  icon: keyof typeof Icon;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
      }}
    >
      {Icon[icon]}
    </span>
  );
}
