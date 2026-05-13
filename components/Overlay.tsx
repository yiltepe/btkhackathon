'use client';

import React, { useEffect } from 'react';

export default function Overlay({
  onClose,
  children,
  dim = 0.35,
}: {
  onClose: () => void;
  children: React.ReactNode;
  dim?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: `rgba(20,18,16,${dim})`,
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
