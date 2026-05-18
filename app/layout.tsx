import './globals.css';
import type { Metadata } from 'next';
import ClerkLocaleProvider from '@/components/ClerkLocaleProvider';

export const metadata: Metadata = {
  title: 'OBEN — Your shopping concierge',
  description: 'Bilingual AI shopping assistant. Drop a link. Better prices, perfect matches, your next look.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkLocaleProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkLocaleProvider>
  );
}
