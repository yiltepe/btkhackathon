'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { trTR, enUS } from '@clerk/localizations';
import { useEffect, useState } from 'react';

function getInitialLocale() {
  if (typeof window === 'undefined') return enUS;
  return localStorage.getItem('oben:lang') === 'tr' ? trTR : enUS;
}

export default function ClerkLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<typeof trTR | typeof enUS>(getInitialLocale);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'oben:lang') setLocale(e.newValue === 'tr' ? trTR : enUS);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <ClerkProvider localization={locale}>{children}</ClerkProvider>;
}
