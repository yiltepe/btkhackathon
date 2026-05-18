'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Lang } from '@/lib/types';

const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_ENABLED === '1';

export default function DemoLoginButton({ lang }: { lang: Lang }) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!DEMO_ENABLED) return null;

  const handleDemo = async () => {
    if (!isLoaded || !signIn || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/demo-login', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const { ticket } = await res.json();
      const result = await signIn.create({ strategy: 'ticket', ticket });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/chat');
      } else {
        setError(`Status: ${result.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button
        type="button"
        onClick={handleDemo}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          color: 'var(--muted)',
          border: '1px solid var(--line)',
          padding: '10px 22px',
          borderRadius: 6,
          fontSize: 13.5,
          fontWeight: 500,
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'border-color .14s, color .14s',
        }}
        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = '#CFCBC0'; e.currentTarget.style.color = 'var(--ink)'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--muted)'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {loading
          ? (lang === 'tr' ? 'Giriş yapılıyor…' : 'Signing in…')
          : (lang === 'tr' ? 'Demo hesabıyla dene' : 'Try with demo account')}
      </button>
      {error && <span style={{ fontSize: 12, color: 'var(--accent)' }}>{error}</span>}
    </div>
  );
}
