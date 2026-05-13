'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Vitrine from '@/components/Vitrine';
import Logo from '@/components/Logo';
import LanguageToggle from '@/components/LanguageToggle';
import { getInitialLang, t } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => setLang(getInitialLang()), []);

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 36px',
          pointerEvents: 'none',
        }}
      >
        <Link href="/" style={{ pointerEvents: 'auto' }}>
          <Logo />
        </Link>
        <div
          style={{
            pointerEvents: 'auto',
            fontSize: 13,
            color: 'var(--muted)',
            display: 'flex',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <LanguageToggle lang={lang} onChange={setLang} />
          <a href="#" style={{ color: 'var(--muted)' }}>{t('nav.journal', lang)}</a>
          <a href="#" style={{ color: 'var(--muted)' }}>{t('nav.about', lang)}</a>
          <Link href="/chat" style={{ color: 'var(--muted)' }}>{t('nav.openApp', lang)}</Link>
        </div>
      </header>

      <Vitrine />

      <main
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
        }}
      >
        <section
          style={{
            pointerEvents: 'auto',
            textAlign: 'center',
            background: 'rgba(250,250,248,0.9)',
            padding: '56px 60px 48px',
            borderRadius: 6,
            boxShadow: '0 0 0 1px rgba(229,229,229,.55), 0 4px 30px -16px rgba(20,16,12,.08)',
            maxWidth: 720,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: '.22em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--accent)',
                marginRight: 8,
                verticalAlign: 'middle',
                transform: 'translateY(-1px)',
              }}
            />
            {t('landing.eyebrow', lang)}
          </div>
          <h1
            style={{
              fontSize: 'clamp(72px, 13vw, 168px)',
              fontWeight: 500,
              lineHeight: 0.92,
              letterSpacing: '-0.045em',
              margin: '0 0 28px',
            }}
          >
            OBEN
          </h1>
          <p
            style={{
              fontSize: 'clamp(17px, 1.5vw, 20px)',
              color: 'var(--ink)',
              maxWidth: 520,
              margin: '0 auto 40px',
              lineHeight: 1.45,
              letterSpacing: '-0.01em',
            }}
          >
            {t('landing.tagline.lead', lang)}{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--muted)' }}>
              {t('landing.tagline.rest', lang)}
            </em>
          </p>
          <Link
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--accent)',
              color: '#FAFAF8',
              padding: '14px 26px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              border: '1px solid var(--accent)',
            }}
          >
            {t('landing.cta', lang)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </main>

      <div
        style={{
          position: 'fixed',
          left: 36,
          bottom: 24,
          zIndex: 25,
          fontSize: 11,
          color: 'var(--muted)',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          fontWeight: 500,
          display: 'flex',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <span>{t('landing.meta.left', lang)}</span>
        <span style={{ width: 24, height: 1, background: 'var(--line)' }} />
        <span>{t('landing.meta.center', lang)}</span>
      </div>
      <div
        style={{
          position: 'fixed',
          right: 36,
          bottom: 24,
          zIndex: 25,
          fontSize: 11,
          color: 'var(--muted)',
          fontWeight: 500,
          letterSpacing: '.04em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {t('landing.meta.right', lang)}
      </div>
    </div>
  );
}
