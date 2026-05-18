'use client';

import { useState } from 'react';
import type { Lang } from '@/lib/types';

export type Plan = 'basic' | 'pro';

export function getStoredPlan(): Plan {
  if (typeof window === 'undefined') return 'basic';
  return (localStorage.getItem('oben:plan') as Plan) ?? 'basic';
}

export function setPlanStorage(plan: Plan) {
  localStorage.setItem('oben:plan', plan);
}

const PLANS = {
  en: [
    {
      key: 'basic' as Plan,
      name: 'Basic',
      price: 'Free',
      desc: 'Everything you need to shop smarter.',
      features: [
        'AI product search',
        'Price comparison across retailers',
        'Link & image analysis',
        'Chat history (20 chats)',
        'EN / TR language toggle',
      ],
      cta: 'Current plan',
      ctaActive: true,
    },
    {
      key: 'pro' as Plan,
      name: 'Pro',
      price: '₺99',
      period: '/ mo',
      desc: 'Unlock AI outfit & room visualisation.',
      features: [
        'Everything in Basic',
        'AI image generation',
        'Outfit & room visualiser',
        'Priority responses',
        'Early access to new modes',
      ],
      cta: 'Upgrade to Pro',
      ctaActive: false,
    },
  ],
  tr: [
    {
      key: 'basic' as Plan,
      name: 'Temel',
      price: 'Ücretsiz',
      desc: 'Daha akıllı alışveriş için ihtiyacın olan her şey.',
      features: [
        'Yapay zeka ürün arama',
        'Perakendeciler arası fiyat karşılaştırma',
        'Link ve görsel analizi',
        'Sohbet geçmişi (20 sohbet)',
        'TR / EN dil desteği',
      ],
      cta: 'Mevcut plan',
      ctaActive: true,
    },
    {
      key: 'pro' as Plan,
      name: 'Pro',
      price: '₺99',
      period: '/ ay',
      desc: 'Yapay zeka kıyafet ve oda görselleştirmesinin kilidini aç.',
      features: [
        'Temeldeki her şey',
        'Yapay zeka görsel üretimi',
        'Kıyafet ve oda görselleştirici',
        'Öncelikli yanıtlar',
        'Yeni modlara erken erişim',
      ],
      cta: "Pro'ya yükselt",
      ctaActive: false,
    },
  ],
};

export default function UpgradeModal({
  lang,
  currentPlan,
  onClose,
  onUpgrade,
}: {
  lang: Lang;
  currentPlan: Plan;
  onClose: () => void;
  onUpgrade: (plan: Plan) => void;
}) {
  const plans = PLANS[lang];
  const [selected, setSelected] = useState<Plan | null>(null);

  const handleSelect = (plan: Plan) => {
    if (plan === currentPlan) return;
    setSelected(plan);
    setPlanStorage(plan);
    onUpgrade(plan);
    setTimeout(onClose, 800);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(17,17,17,.36)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 6,
          boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 20px 60px -30px rgba(0,0,0,.18)',
          padding: '36px 40px 40px',
          maxWidth: 600,
          width: '100%',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            {lang === 'tr' ? 'Planlar' : 'Plans'}
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: '-.025em' }}>
            {lang === 'tr' ? 'Planınızı seçin' : 'Choose your plan'}
          </h2>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {plans.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const isSelected = selected === plan.key;
            const isPro = plan.key === 'pro';
            return (
              <div
                key={plan.key}
                style={{
                  border: `1.5px solid ${isPro ? 'var(--accent)' : 'var(--line)'}`,
                  borderRadius: 6,
                  padding: '22px 22px 20px',
                  background: isPro ? 'rgba(124,45,18,.03)' : '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  position: 'relative',
                }}
              >
                {isPro && (
                  <span style={{
                    position: 'absolute', top: -10, right: 16,
                    background: 'var(--accent)', color: '#FAFAF8',
                    fontSize: 10, fontWeight: 500, letterSpacing: '.1em',
                    textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20,
                  }}>
                    {lang === 'tr' ? 'Önerilen' : 'Recommended'}
                  </span>
                )}

                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: isPro ? 'var(--accent)' : 'var(--muted)', letterSpacing: '-.005em', marginBottom: 4 }}>
                    {plan.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-.03em' }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{plan.period}</span>}
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>{plan.desc}</p>
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, lineHeight: 1.4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isPro ? 'var(--accent)' : 'var(--muted)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M5 12l4 4L19 6" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelect(plan.key)}
                  disabled={isCurrent}
                  style={{
                    marginTop: 'auto',
                    padding: '9px 0',
                    borderRadius: 5,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: isCurrent ? 'default' : 'pointer',
                    border: isPro ? '0' : '1px solid var(--line)',
                    background: isCurrent
                      ? 'var(--pill)'
                      : isPro
                      ? isSelected ? '#5A1F0C' : 'var(--accent)'
                      : '#FFFFFF',
                    color: isCurrent ? 'var(--muted)' : isPro ? '#FAFAF8' : 'var(--ink)',
                    transition: 'background .15s',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => { if (!isCurrent && isPro) e.currentTarget.style.background = '#5A1F0C'; }}
                  onMouseLeave={(e) => { if (!isCurrent && isPro) e.currentTarget.style.background = isSelected ? '#5A1F0C' : 'var(--accent)'; }}
                >
                  {isCurrent
                    ? (lang === 'tr' ? '✓ Mevcut plan' : '✓ Current plan')
                    : isSelected
                    ? (lang === 'tr' ? '✓ Aktif edildi' : '✓ Activated')
                    : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ margin: '18px 0 0', fontSize: 11.5, color: 'var(--muted-2)', textAlign: 'center' }}>
          {lang === 'tr'
            ? 'Ödeme demo amaçlıdır. Gerçek işlem yapılmaz.'
            : 'Payment is for demo purposes. No real charge is made.'}
        </p>
      </div>
    </div>
  );
}
