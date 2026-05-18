'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import LanguageToggle from '@/components/LanguageToggle';
import { getInitialLang, t } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { SignedIn, SignedOut, SignUpButton, UserButton } from '@clerk/nextjs';

const RAIL = [
  '/vitrine/hanger/01.webp',
  '/vitrine/hanger/02.webp',
  '/vitrine/hanger/03.webp',
  '/vitrine/hanger/04.webp',
  '/vitrine/hanger/05.webp',
  '/vitrine/hanger/06.webp',
  '/vitrine/hanger/07.webp',
  '/vitrine/hanger/08.webp',
  '/vitrine/hanger/09.webp',
  '/vitrine/hanger/10.webp',
  '/vitrine/hanger/11.webp',
  '/vitrine/hanger/12.webp',
];

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setLang(getInitialLang());
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="about-root">
      <style>{ABOUT_CSS}</style>

      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="logo">
          <Logo />
        </Link>
        <div className="nav-right">
          <LanguageToggle lang={lang} onChange={setLang} />
          <Link href="/" className="nav-link">{t('nav.back', lang)}</Link>
          <SignedIn>
            <Link href="/chat" className="nav-cta">
              {t('nav.openApp', lang).replace(' →', '')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="modal">
              <button type="button" className="nav-cta">
                {t('auth.signUp', lang)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="eyebrow hero-eye"><span className="dot" />{t('about.hero.eyebrow', lang)}</div>
          <h1>
            {t('about.hero.h1a', lang)}<em>{t('about.hero.h1b', lang)}</em>
          </h1>
          <div className="hero-bottom">
            <p className="lede">{t('about.hero.lede', lang)}</p>
          </div>

          <div className="mini-rail" aria-hidden="true">
            <div className="mini-track">
              {RAIL.concat(RAIL).concat(RAIL).map((src, i) => (
                <div className="mini" key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="container">
          <div className="eyebrow"><span className="dot" />{t('about.manifesto.eyebrow', lang)}</div>
          <h2>
            {t('about.manifesto.h2a', lang)}
            <em>{t('about.manifesto.h2b', lang)}</em>
            {t('about.manifesto.h2c', lang)}
          </h2>
          <div className="manifesto-foot">
            <p><b>{t('about.manifesto.restraintT', lang)}</b>{t('about.manifesto.restraintB', lang)}</p>
            <p><b>{t('about.manifesto.honestyT', lang)}</b>{t('about.manifesto.honestyB', lang)}</p>
            <p><b>{t('about.manifesto.tasteT', lang)}</b>{t('about.manifesto.tasteB', lang)}</p>
          </div>
        </div>
      </section>

      {/* MODES */}
      <section className="modes">
        <div className="container">
          <div className="modes-head">
            <div>
              <div className="eyebrow"><span className="dot" />{t('about.modes.eyebrow', lang)}</div>
              <h2>{t('about.modes.h2', lang)}</h2>
            </div>
          </div>

          <div className="modes-grid">
            <article className="mode-card">
              <div className="ill ill-price">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/vitrine/square/03.webp" alt="" />
              </div>
              <div className="body">
                <span className="num">{t('about.modes.priceNum', lang)}</span>
                <h3>{t('about.modes.priceT', lang)}</h3>
                <p>{t('about.modes.priceB', lang)}</p>
                <div className="tag-row">
                  <span>{t('about.modes.priceTag1', lang)}</span>
                  <span>{t('about.modes.priceTag2', lang)}</span>
                  <span>{t('about.modes.priceTag3', lang)}</span>
                </div>
              </div>
            </article>

            <article className="mode-card">
              <div className="ill">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/vitrine/square/07.webp" alt="" />
              </div>
              <div className="body">
                <span className="num">{t('about.modes.fashionNum', lang)}</span>
                <h3>{t('about.modes.fashionT', lang)}</h3>
                <p>{t('about.modes.fashionB', lang)}</p>
                <div className="tag-row">
                  <span>{t('about.modes.fashionTag1', lang)}</span>
                  <span>{t('about.modes.fashionTag2', lang)}</span>
                  <span>{t('about.modes.fashionTag3', lang)}</span>
                </div>
              </div>
            </article>

            <article className="mode-card">
              <div className="ill">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/vitrine/square/14.webp" alt="" />
              </div>
              <div className="body">
                <span className="num">{t('about.modes.homeNum', lang)}</span>
                <h3>{t('about.modes.homeT', lang)}</h3>
                <p>{t('about.modes.homeB', lang)}</p>
                <div className="tag-row">
                  <span>{t('about.modes.homeTag1', lang)}</span>
                  <span>{t('about.modes.homeTag2', lang)}</span>
                  <span>{t('about.modes.homeTag3', lang)}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <div className="container">
          <div className="how-grid">
            <div>
              <div className="eyebrow"><span className="dot" />{t('about.how.eyebrow', lang)}</div>
              <h2>{t('about.how.h2', lang)}</h2>
            </div>
            <div className="how-steps">
              <div className="step">
                <div className="snum">01</div>
                <div>
                  <h3>{t('about.how.step1T', lang)}</h3>
                  <p>{t('about.how.step1B', lang)}</p>
                </div>
                <div className="glyph">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                    <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                  </svg>
                </div>
              </div>
              <div className="step">
                <div className="snum">02</div>
                <div>
                  <h3>{t('about.how.step2T', lang)}</h3>
                  <p>{t('about.how.step2B', lang)}</p>
                </div>
                <div className="glyph">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </div>
              </div>
              <div className="step">
                <div className="snum">03</div>
                <div>
                  <h3>{t('about.how.step3T', lang)}</h3>
                  <p>{t('about.how.step3B', lang)}</p>
                </div>
                <div className="glyph">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <div className="eyebrow cta-eye"><span className="dot" />{t('about.cta2.eyebrow', lang)}</div>
          <h2>
            {t('about.cta2.h2a', lang)}<em>{t('about.cta2.h2b', lang)}</em>
          </h2>
          <SignedIn>
            <Link className="cta-btn" href="/chat">
              {t('about.cta2.btn', lang)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="modal">
              <button type="button" className="cta-btn">
                {t('about.cta2.btn', lang)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </section>

      <footer className="foot">
        <div className="container">
          <div className="foot-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Logo />
              <span style={{ marginLeft: 14, color: 'var(--muted-2, #9A9A93)' }}>© 2026 — {t('about.footer.right', lang)}</span>
            </div>
            <div className="foot-links">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const ABOUT_CSS = `
  .about-root {
    --bg:#FAFAF8;
    --bg-cream:#F4F1EA;
    --bg-ink:#1A1714;
    --ink:#111111;
    --muted:#7A7A75;
    --muted-2:#9A9A93;
    --line:#E5E5E5;
    --line-soft:#EDEDEA;
    --accent:#7C2D12;
    --accent-soft:#9C3D20;
    background: var(--bg);
    color: var(--ink);
    min-height: 100vh;
    letter-spacing: -0.005em;
  }
  .about-root a { color: inherit; text-decoration: none; }
  .about-root ::selection { background:#1A1714; color:#FAFAF8; }

  .about-root .nav{
    position:sticky; top:0; z-index:30;
    display:flex; align-items:center; justify-content:space-between;
    padding:22px 40px;
    background: rgba(250,250,248,.92);
    backdrop-filter: blur(8px);
    border-bottom:1px solid transparent;
    transition: border-color .25s;
  }
  .about-root .nav.scrolled{ border-bottom-color: var(--line); }
  .about-root .logo{ display:flex; align-items:center; }
  .about-root .nav-right{
    font-size:13px; color:var(--muted);
    display:flex; gap:22px; align-items:center;
  }
  .about-root .nav-link{ color:var(--muted); }
  .about-root .nav-link:hover{ color:var(--ink); }
  .about-root .nav-cta{
    color:#FAFAF8; background:var(--ink);
    padding:8px 14px; border-radius:5px;
    display:inline-flex; align-items:center; gap:7px;
    font-size:12.5px; font-weight:500;
    border:0; cursor:pointer;
    transition: background .15s, transform .15s;
  }
  .about-root .nav-cta:hover{ background:#000; transform: translateY(-1px); }
  .about-root .nav-cta svg{ width:11px; height:11px; }

  .about-root .container{ max-width:1240px; margin:0 auto; padding:0 40px; }
  .about-root .eyebrow{
    font-size:11px; letter-spacing:.18em; text-transform:uppercase;
    color:var(--muted); font-weight:500;
    display:inline-flex; align-items:center; gap:8px; white-space:nowrap;
  }
  .about-root .eyebrow .dot{ width:5px; height:5px; border-radius:50%; background:var(--accent); }

  /* HERO */
  .about-root .hero{ padding: 96px 0 110px; }
  .about-root .hero-eye{ margin-bottom: 28px; }
  .about-root .hero h1{
    font-size: clamp(56px, 8.8vw, 132px);
    font-weight:500; line-height:.94; letter-spacing:-0.045em;
    margin:0; max-width:10ch; text-wrap:balance;
  }
  .about-root .hero h1 em{ font-style:normal; color:var(--muted-2); }
  .about-root .hero-bottom{ margin-top:72px; }
  .about-root .hero-bottom .lede{
    font-size:19px; line-height:1.55; color:var(--ink);
    letter-spacing:-0.008em; text-wrap:pretty; max-width:60ch;
  }

  .about-root .mini-rail{
    margin-top:56px; overflow:hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
            mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
  }
  .about-root .mini-track{
    display:flex; gap:14px; width: max-content;
    animation: oben-rail-drift 60s linear infinite;
  }
  .about-root .mini-rail:hover .mini-track{ animation-play-state: paused; }
  .about-root .mini-rail .mini{
    flex:0 0 auto; width:120px; height:150px;
    background:#FFFFFF; border:1px solid var(--line-soft); border-radius:4px;
    overflow:hidden;
    box-shadow: 0 6px 18px -10px rgba(20,16,12,.18), 0 2px 4px rgba(20,16,12,.04);
  }
  .about-root .mini-rail .mini img{
    width:100%; height:100%; object-fit:cover; display:block;
  }
  @keyframes oben-rail-drift {
    from { transform: translateX(0); }
    to   { transform: translateX(calc(-1 * (120px + 14px) * 12)); }
  }
  @media (prefers-reduced-motion: reduce){
    .about-root .mini-track{ animation: none; }
  }

  /* MANIFESTO */
  .about-root .manifesto{ padding: 110px 0; background: var(--bg-ink); color:#F4EFE6; }
  .about-root .manifesto .container{ max-width:980px; }
  .about-root .manifesto .eyebrow{ color:#A89A82; }
  .about-root .manifesto .eyebrow .dot{ background: var(--accent-soft); }
  .about-root .manifesto h2{
    font-size: clamp(34px, 4.6vw, 60px);
    font-weight:500; line-height:1.08; letter-spacing:-.025em;
    margin:24px 0 0; color:#FAF4E8; text-wrap:balance;
  }
  .about-root .manifesto h2 em{ font-style:normal; color:#8B7A60; }
  .about-root .manifesto-foot{
    margin-top:64px; padding-top:28px; border-top:1px solid #2D2620;
    display:grid; grid-template-columns: 1fr 1fr 1fr; gap:48px;
    font-size:13.5px; line-height:1.55; color:#C8BBA0;
  }
  .about-root .manifesto-foot p{ margin:0; text-wrap:pretty; }
  .about-root .manifesto-foot p b{
    color:#FAF4E8; font-weight:500; display:block; margin-bottom:6px;
    font-size:11px; text-transform:uppercase; letter-spacing:.14em;
  }

  /* MODES */
  .about-root .modes{ padding: 120px 0 100px; }
  .about-root .modes-head{
    display:flex; justify-content:space-between; align-items:flex-end;
    margin-bottom:56px; gap:40px;
  }
  .about-root .modes-head h2{
    font-size: clamp(32px, 4vw, 48px);
    font-weight:500; line-height:1.04; letter-spacing:-.025em;
    margin:14px 0 0; max-width:18ch; text-wrap:balance;
  }
  .about-root .modes-head .modes-side{
    font-size:13.5px; color:var(--muted); line-height:1.55;
    max-width:32ch; text-wrap:pretty;
  }
  .about-root .modes-grid{ display:grid; grid-template-columns: repeat(3, 1fr); gap:24px; }
  .about-root .mode-card{
    border:1px solid var(--line); background:#FFFFFF; border-radius:6px;
    overflow:hidden; display:flex; flex-direction:column;
    transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  }
  .about-root .mode-card:hover{
    transform: translateY(-4px);
    border-color: #D8D2C5;
    box-shadow: 0 18px 40px -22px rgba(20,16,12,.22), 0 2px 6px rgba(20,16,12,.05);
  }
  .about-root .mode-card .ill{
    aspect-ratio: 4/3; background: var(--bg-cream);
    border-bottom:1px solid var(--line-soft); overflow:hidden;
  }
  .about-root .mode-card .ill img{
    width:100%; height:100%; object-fit:cover; display:block;
    transition: transform .5s ease;
  }
  .about-root .mode-card:hover .ill img{ transform: scale(1.04); }
  .about-root .mode-card .body{
    padding: 22px 24px 26px;
    display:flex; flex-direction:column; gap:10px; flex:1;
  }
  .about-root .mode-card .num{
    font-size:11px; letter-spacing:.16em; text-transform:uppercase;
    color:var(--muted); font-weight:500; font-variant-numeric:tabular-nums;
  }
  .about-root .mode-card h3{
    margin:0; font-size:22px; font-weight:500; letter-spacing:-.018em; line-height:1.15;
  }
  .about-root .mode-card p{
    margin:0; font-size:13.5px; line-height:1.55; color:var(--muted); text-wrap:pretty;
  }
  .about-root .mode-card .tag-row{
    display:flex; flex-wrap:wrap; gap:6px; margin-top:auto; padding-top:14px;
  }
  .about-root .mode-card .tag-row span{
    font-size:11px; color:var(--ink); background:var(--bg-cream);
    padding:4px 9px; border-radius:3px; font-weight:500;
  }

  /* HOW */
  .about-root .how{
    padding: 100px 0 110px; background: var(--bg-cream);
    border-top:1px solid var(--line); border-bottom:1px solid var(--line);
  }
  .about-root .how-grid{
    display:grid; grid-template-columns: 1fr 2.2fr; gap:96px; align-items:flex-start;
  }
  .about-root .how-grid h2{
    font-size: clamp(32px, 4vw, 48px);
    font-weight:500; line-height:1.04; letter-spacing:-.025em;
    margin:16px 0 0; max-width:14ch; text-wrap:balance;
  }
  .about-root .how-steps{ display:flex; flex-direction:column; }
  .about-root .step{
    display:grid; grid-template-columns: 80px 1fr auto; gap:32px;
    align-items:flex-start; padding:28px 0 30px;
    border-bottom:1px solid #E0D9C6;
  }
  .about-root .step:last-child{ border-bottom:0; }
  .about-root .step .snum{
    font-size:40px; font-weight:500; color:var(--accent);
    letter-spacing:-.02em; font-variant-numeric:tabular-nums; line-height:1;
  }
  .about-root .step h3{ margin:0 0 6px; font-size:20px; font-weight:500; letter-spacing:-.015em; }
  .about-root .step p{
    margin:0; font-size:14.5px; line-height:1.55; color:var(--ink);
    text-wrap:pretty; max-width:52ch; opacity:.85;
  }
  .about-root .step .glyph{ width:64px; height:64px; display:grid; place-items:center; color:var(--muted); }
  .about-root .step .glyph svg{ width:36px; height:36px; }

  /* PRINCIPLES */
  .about-root .principles{ padding: 110px 0 90px; }
  .about-root .pr-head{ margin-bottom:56px; }
  .about-root .pr-head h2{
    font-size: clamp(32px, 4vw, 48px); font-weight:500; line-height:1.04;
    letter-spacing:-.025em; margin:14px 0 0; max-width:16ch; text-wrap:balance;
  }
  .about-root .pr-grid{
    display:grid; grid-template-columns: repeat(4, 1fr); gap:0;
    border-top:1px solid var(--line);
  }
  .about-root .pr{
    padding: 28px 24px 32px;
    border-right:1px solid var(--line); border-bottom:1px solid var(--line);
    display:flex; flex-direction:column; gap:10px; min-height:200px;
  }
  .about-root .pr:nth-child(4n){ border-right:0; }
  .about-root .pr .pr-n{
    font-size:11px; letter-spacing:.16em; text-transform:uppercase;
    color:var(--muted); font-weight:500; font-variant-numeric:tabular-nums;
  }
  .about-root .pr h3{ margin:0; font-size:17px; font-weight:500; letter-spacing:-.012em; line-height:1.3; }
  .about-root .pr p{ margin:4px 0 0; font-size:13px; line-height:1.55; color:var(--muted); text-wrap:pretty; }

  /* CTA */
  .about-root .cta{
    padding: 130px 0 140px; text-align:center;
    border-top:1px solid var(--line); background: var(--bg);
  }
  .about-root .cta-eye{ margin-bottom:24px; }
  .about-root .cta h2{
    font-size: clamp(48px, 7vw, 96px);
    font-weight:500; line-height:.96; letter-spacing:-.04em;
    margin:0 0 40px; text-wrap:balance; max-width:14ch; margin-inline:auto;
  }
  .about-root .cta h2 em{ font-style:normal; color:var(--muted-2); }
  .about-root .cta-btn{
    display:inline-flex; align-items:center; gap:10px;
    background:var(--accent); color:#FAFAF8;
    padding:15px 28px; border-radius:6px;
    font-size:14.5px; font-weight:500; border:0; cursor:pointer;
    transition: background .15s, transform .15s;
  }
  .about-root .cta-btn:hover{ background:#5A1F0C; transform: translateY(-1px); }
  .about-root .cta-btn svg{ width:14px; height:14px; }

  /* FOOT */
  .about-root .foot{
    padding: 40px 0 36px; border-top:1px solid var(--line);
    font-size:12px; color:var(--muted);
  }
  .about-root .foot-row{
    display:flex; justify-content:space-between; align-items:center; gap:24px;
  }
  .about-root .foot-links{ display:flex; gap:22px; }
  .about-root .foot-links a:hover{ color:var(--ink); }

  @media (max-width: 900px){
    .about-root .container{ padding:0 22px; }
    .about-root .nav{ padding:18px 22px; }
    .about-root .nav-right{ gap:14px; }
    .about-root .hero{ padding: 56px 0 70px; }
    .about-root .hero-bottom{ margin-top:48px; }
    .about-root .manifesto{ padding: 70px 0; }
    .about-root .manifesto-foot{ grid-template-columns: 1fr; gap:24px; }
    .about-root .modes{ padding: 72px 0; }
    .about-root .modes-head{ flex-direction:column; align-items:flex-start; }
    .about-root .modes-grid{ grid-template-columns: 1fr; }
    .about-root .how{ padding: 70px 0; }
    .about-root .how-grid{ grid-template-columns: 1fr; gap:28px; }
    .about-root .step{ grid-template-columns: 50px 1fr; gap:18px; }
    .about-root .step .glyph{ display:none; }
    .about-root .cta{ padding: 80px 0; }
    .about-root .foot-row{ flex-direction:column; align-items:flex-start; gap:16px; }
  }
`;
