'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import LanguageToggle from '@/components/LanguageToggle';
import { getInitialLang, t } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { SignedIn, SignedOut, SignUpButton, UserButton } from '@clerk/nextjs';

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    setLang(getInitialLang());
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header
        className="oben-landing-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 36px',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--line-soft)',
        }}
      >
        <Link href="/">
          <Logo />
        </Link>
        <div
          className="oben-landing-nav"
          style={{
            fontSize: 13,
            color: 'var(--muted)',
            display: 'flex',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <LanguageToggle lang={lang} onChange={setLang} />
          <Link href="/" style={{ color: 'var(--muted)' }}>{t('nav.back', lang)}</Link>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '72px 28px 96px',
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
          {t('about.eyebrow', lang)}
        </div>

        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 500,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            margin: '0 0 28px',
          }}
        >
          {t('about.heading', lang)}
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: 'var(--ink)',
            letterSpacing: '-0.005em',
            margin: '0 0 48px',
            maxWidth: 600,
          }}
        >
          {t('about.lead', lang)}
        </p>

        <Section title={t('about.section1.title', lang)} body={t('about.section1.body', lang)} />
        <Section title={t('about.section2.title', lang)} body={t('about.section2.body', lang)} />
        <Section title={t('about.section3.title', lang)} body={t('about.section3.body', lang)} />

        <div style={{ marginTop: 48 }}>
          <SignedIn>
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
              {t('about.cta', lang)}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="modal">
              <button
                type="button"
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
                  cursor: 'pointer',
                }}
              >
                {t('about.cta', lang)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </main>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section style={{ marginBottom: 36, maxWidth: 600 }}>
      <h2
        style={{
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '-0.005em',
          margin: '0 0 10px',
          color: 'var(--ink)',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: 'var(--muted)',
          letterSpacing: '-0.005em',
          margin: 0,
        }}
      >
        {body}
      </p>
    </section>
  );
}
