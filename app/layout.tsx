import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OBEN — Your shopping concierge',
  description: 'Bilingual AI shopping assistant. Drop a link. Better prices, perfect matches, your next look.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
