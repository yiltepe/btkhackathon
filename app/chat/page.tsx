'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import InputBar from '@/components/InputBar';
import LanguageToggle from '@/components/LanguageToggle';
import PriceCard from '@/components/PriceCard';
import LookCard from '@/components/LookCard';
import LinksModal from '@/components/LinksModal';
import VisualModal from '@/components/VisualModal';
import CartDrawer from '@/components/CartDrawer';
import GenderModal from '@/components/GenderModal';
import ComparisonCard from '@/components/ComparisonCard';
import UpgradeModal, { getStoredPlan, setPlanStorage, type Plan } from '@/components/UpgradeModal';
import { useUser, UserButton, SignedIn } from '@clerk/nextjs';
import { getInitialLang, t } from '@/lib/i18n';
import { addToCart as cartAdd, removeFromCart as cartRemove } from '@/lib/cart';
import { makeChat, upsertChat, deleteChat } from '@/lib/chats';
import { compressImage, extractUrls } from '@/lib/image';
import { mockProducts, inferMode } from '@/lib/mocks';
import { isTrusted } from '@/lib/retailers';
import { defaultBudget, parseBudgetFromMessage, mergeBudget } from '@/lib/prefs';
import { loadUserState, saveUserState } from '@/lib/userState';
import type {
  Attachment,
  Budget,
  CartItem,
  Chat,
  Gender,
  Lang,
  Message,
  Mode,
  Product,
  ResolvedProduct,
  StandardResponse,
} from '@/lib/types';

const MAX_ATTACHMENTS = 4;

type ApiErrorResponse = {
  error?: 'missing_api_key' | 'rate_limited' | 'provider_denied' | 'provider_unavailable' | 'invalid_response' | string;
  provider?: string;
  status?: number;
  retryable?: boolean;
};

type ChatResult =
  | { ok: true; response: StandardResponse }
  | { ok: false; message: string };

const GENDER_LABELS: Record<Gender, { en: string; tr: string }> = {
  men: { en: 'Men', tr: 'Erkek' },
  women: { en: 'Women', tr: 'Kadın' },
  unisex: { en: 'Unisex', tr: 'Unisex' },
};

const SUGGEST_PROMPTS = [
  { mode: 'price' as Mode, labelKey: 'prompt.price.label', exampleKey: 'prompt.price.example' },
  { mode: 'fashion' as Mode, labelKey: 'prompt.fashion.label', exampleKey: 'prompt.fashion.example' },
  { mode: 'home' as Mode, labelKey: 'prompt.home.label', exampleKey: 'prompt.home.example' },
  { mode: 'electronics' as Mode, labelKey: 'prompt.electronics.label', exampleKey: 'prompt.electronics.example' },
];

function localizeApiError(err: ApiErrorResponse, lang: Lang): string {
  switch (err.error) {
    case 'rate_limited':
      return t('chat.error.rateLimited', lang);
    case 'provider_denied':
      return t('chat.error.providerDenied', lang);
    case 'provider_unavailable':
      return t('chat.error.providerUnavailable', lang);
    case 'invalid_response':
      return t('chat.error.invalidResponse', lang);
    case 'missing_api_key':
      return t('chat.error.missingApiKey', lang);
    default:
      return t('chat.error.generic', lang);
  }
}

function EmptyState({
  lang,
  onPromptClick,
}: {
  lang: Lang;
  onPromptClick: (mode: Mode) => void;
}) {
  return (
    <div
      className="oben-empty-state"
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px 40px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '.16em',
          fontWeight: 500,
          marginBottom: 18,
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
        {t('chat.empty.eyebrow', lang)}
      </div>
      <h1
        style={{
          fontSize: 'clamp(34px, 4.2vw, 52px)',
          fontWeight: 500,
          letterSpacing: '-.035em',
          lineHeight: 1.02,
          margin: '0 0 14px',
          textAlign: 'center',
          maxWidth: 760,
        }}
      >
        {t('chat.empty.heading', lang)}
      </h1>
      <p
        style={{
          margin: '0 0 36px',
          maxWidth: 560,
          textAlign: 'center',
          fontSize: 15,
          color: 'var(--muted)',
          lineHeight: 1.5,
        }}
      >
        {t('chat.empty.headline', lang)}
      </p>

      <div
        className="oben-empty-prompts"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 280px))',
          gap: 10,
          width: '100%',
          maxWidth: 600,
        }}
      >
        {SUGGEST_PROMPTS.map((p) => (
          <button
            key={p.mode}
            onClick={() => onPromptClick(p.mode)}
            style={{
              textAlign: 'left',
              padding: '13px 14px',
              border: '1px solid var(--line)',
              borderRadius: 6,
              background: 'var(--bg-soft)',
              transition: 'border-color .14s, background .14s',
            }}
            onMouseEnter={(ev) => {
              ev.currentTarget.style.borderColor = '#CFCBC0';
            }}
            onMouseLeave={(ev) => {
              ev.currentTarget.style.borderColor = 'var(--line)';
            }}
          >
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                letterSpacing: '-.005em',
                marginBottom: 3,
              }}
            >
              {t(p.labelKey as never, lang)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {t(p.exampleKey as never, lang)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function UserMsg({ msg }: { msg: Message }) {
  const atts: Attachment[] = msg.attachments && msg.attachments.length
    ? msg.attachments
    : msg.attachment
    ? [msg.attachment]
    : [];
  const images = atts.filter((a) => a.kind === 'image' && a.preview);
  return (
    <div className="oben-msg-in" style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 0' }}>
      <div
        style={{
          background: '#F0F0EE',
          color: 'var(--ink)',
          padding: '10px 16px',
          borderRadius: 18,
          maxWidth: '70%',
          fontSize: 14.5,
          lineHeight: 1.45,
          letterSpacing: '-.005em',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        {images.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: msg.text ? 8 : 0 }}>
            {images.map((a, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={a.preview!}
                alt=""
                style={{
                  display: 'block',
                  width: images.length > 1 ? 110 : 240,
                  height: images.length > 1 ? 110 : 'auto',
                  maxWidth: 240,
                  maxHeight: 240,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            ))}
          </div>
        )}
        {msg.text}
      </div>
    </div>
  );
}

function AIMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="oben-msg-in" style={{ padding: '20px 0 8px', maxWidth: '88%' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '.12em',
          fontWeight: 500,
          marginBottom: 12,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />
        OBEN
      </div>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: 'var(--ink)',
          letterSpacing: '-.005em',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TypingDots({ label }: { label: string }) {
  return (
    <div className="oben-msg-in" style={{ padding: '18px 0' }}>
      <div
        key={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          color: 'var(--ink)',
          fontWeight: 500,
          letterSpacing: '-0.005em',
          animation: 'oben-status-in 220ms ease-out',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'oben-pulse 1.2s ease-in-out infinite',
          }}
        />
        <span>{label}</span>
        <span className="oben-typing" aria-label={label} style={{ marginLeft: 2 }}>
          <span />
          <span />
          <span />
        </span>
      </div>
      <style jsx>{`
        @keyframes oben-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.85); }
        }
        @keyframes oben-status-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const uid = user?.id ?? null;
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<Mode>('auto');
  const [input, setInput] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<{ base64: string; mimeType: string; preview: string }[]>([]);
  const [attachLimitNote, setAttachLimitNote] = useState<string | null>(null);
  const [linksOpen, setLinksOpen] = useState<{ products: Product[]; name: string; loading?: boolean } | null>(null);
  const [visualOpen, setVisualOpen] = useState<{
    msgId: string;
    kind: 'fashion' | 'home';
    description: string;
    items: Product[];
    imagePrompt?: string;
    pieces?: { description: string }[];
    anchor?: { imageBase64: string; mimeType: string; type?: string };
  } | null>(null);
  const [imageMemo, setImageMemo] = useState<Record<string, string>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [gender, setGender] = useState<Gender | null>(null);
  const [budget, setBudget] = useState<Budget>(defaultBudget('en'));
  const [genderModalOpen, setGenderModalOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>('basic');
  const [prefsSummary, setPrefsSummary] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLang(getInitialLang());
    setPlan(getStoredPlan());
  }, []);

  const prevUidRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!userLoaded) return;
    const initialLang = getInitialLang();
    const isAccountSwitch = prevUidRef.current !== undefined && prevUidRef.current !== uid;
    prevUidRef.current = uid;

    if (isAccountSwitch) {
      setActiveId(null);
      setMessages([]);
    }
    if (!uid) {
      setCart([]);
      setChats([]);
      setGender(null);
      setBudget(defaultBudget(initialLang));
      setPrefsSummary('');
      return;
    }

    let cancelled = false;
    (async () => {
      const state = await loadUserState();
      if (cancelled) return;
      setCart(state.cart);
      setChats(state.chats);
      setGender(state.gender);
      setBudget(state.budget ?? defaultBudget(initialLang));
      setPrefsSummary(state.prefsSummary);
    })();
    return () => { cancelled = true; };
  }, [userLoaded, uid]);

  const updateGender = (g: Gender) => {
    setGender(g);
    setGenderModalOpen(false);
    void saveUserState({ gender: g });
  };

  const updateBudget = (b: Budget) => {
    setBudget(b);
    void saveUserState({ budget: b });
  };

  const compareProduct = async (p: Product, m: Mode) => {
    setLinksOpen({ products: [p], name: p.name, loading: true });
    const more = await fetchProducts(p.name, m);
    const seen = new Set<string>([p.retailer.toLowerCase()]);
    const merged = [p, ...more.filter((x) => {
      const k = x.retailer.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })];
    merged.sort((a, b) => {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return a.price - b.price;
    });
    setLinksOpen({ products: merged, name: p.name, loading: false });
  };

  const appendToInput = (chip: string) => {
    setInput((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return chip;
      if (trimmed.toLowerCase().split(/[,\s]+/).includes(chip.toLowerCase())) return prev;
      return `${trimmed}, ${chip}`;
    });
  };

  const cartHydrated = useRef(false);
  useEffect(() => {
    if (!userLoaded || !uid) return;
    if (!cartHydrated.current) {
      cartHydrated.current = true;
      return;
    }
    void saveUserState({ cart });
  }, [cart, uid, userLoaded]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pending]);

  const persistChat = (msgs: Message[]) => {
    if (msgs.length === 0) return;
    const firstUser = msgs.find((m) => m.role === 'user');
    if (!firstUser) return;
    let chat: Chat;
    if (activeId) {
      const existing = chats.find((c) => c.id === activeId);
      chat = existing
        ? { ...existing, messages: msgs, prefsSummary }
        : makeChat(firstUser, lang);
      if (!existing) setActiveId(chat.id);
    } else {
      chat = makeChat(firstUser, lang);
      chat.messages = msgs;
      chat.prefsSummary = prefsSummary;
      setActiveId(chat.id);
    }
    const next = upsertChat(chats, chat);
    setChats(next);
    void saveUserState({ chats: next });
  };

  const addProductToCart = (p: Product) => {
    const item: CartItem = {
      id: `${p.retailer}-${p.name}-${p.price ?? 'x'}`,
      name: p.name,
      retailer: p.retailer,
      price: p.price,
      currency: p.currency,
      link: p.link,
      thumbnail: p.thumbnail,
    };
    setCart((prev) => cartAdd(prev, item));
  };

  const callChat = async (
    text: string,
    resolvedProducts: ResolvedProduct[],
  ): Promise<ChatResult> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          resolvedProduct: resolvedProducts[0],
          resolvedProducts,
          mode,
          chatHistory: messages,
          language: lang,
          gender,
          budget,
          prefsSummary,
        }),
      });
      const data = (await res.json()) as StandardResponse | ApiErrorResponse;
      if (!res.ok) {
        return { ok: false, message: localizeApiError(data as ApiErrorResponse, lang) };
      }
      return { ok: true, response: data as StandardResponse };
    } catch {
      return { ok: false, message: t('chat.error.generic', lang) };
    }
  };

  const fetchProducts = async (query: string, m: Mode, budgetOverride?: Budget): Promise<Product[]> => {
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode: m, language: lang, gender, budget: budgetOverride ?? budget }),
      });
      const data = (await res.json()) as { products: Product[] };
      return data.products ?? [];
    } catch {
      return [];
    }
  };

  const handleResponse = async (response: StandardResponse, baseMessages: Message[], forceShoppingIntent = false) => {
    if (response.prefsSummary && response.prefsSummary.trim()) {
      const trimmed = response.prefsSummary.trim().slice(0, 200);
      setPrefsSummary(trimmed);
      void saveUserState({ prefsSummary: trimmed });
    }
    const lastUserMsg = [...baseMessages].reverse().find((m) => m.role === 'user')?.text ?? '';
    const inMsgBudget = parseBudgetFromMessage(lastUserMsg, lang);
    const effectiveBudget: Budget = inMsgBudget ? mergeBudget(budget, inMsgBudget) : budget;
    const VALID_MODES: Mode[] = ['price', 'fashion', 'home', 'electronics', 'beauty'];
    const isChitchat = (response.mode as string) === 'chitchat';
    let resolvedMode: Mode = response.mode as Mode;
    if (!VALID_MODES.includes(resolvedMode)) {
      resolvedMode = isChitchat ? 'price' : inferMode(response.text);
    }
    const needsClarification = !!(response.clarify?.groups?.length);
    const hasShoppingIntent =
      !isChitchat &&
      !needsClarification && (
        forceShoppingIntent ||
        !!response.identifiedItem ||
        (response.suggestions?.length ?? 0) > 0 ||
        (response.retailers?.length ?? 0) > 0 ||
        response.hasVisual ||
        resolvedMode !== 'price'
      );

    let products: Product[] = response.retailers ?? [];
    let productsByIndex: Message['productsByIndex'] | undefined;

    const lastUser = [...baseMessages].reverse().find((m) => m.role === 'user');
    const lensFromResolve = lastUser?.resolvedProducts?.flatMap((rp) => rp.lensProducts ?? []) ?? [];

    if (hasShoppingIntent && products.length === 0 && resolvedMode === 'price' && lensFromResolve.length > 0) {
      const { min, max } = effectiveBudget;
      const filtered = (min === null && max === null)
        ? lensFromResolve
        : lensFromResolve.filter((p) => {
            if (p.price === null) return true;
            if (min !== null && p.price < min) return false;
            if (max !== null && p.price > max) return false;
            return true;
          });
      if (filtered.length >= 3) {
        products = filtered.slice(0, 12);
        console.log(`[chat] using ${products.length} Google Lens matches, skipping /api/search`);
      }
    }

    // Multi-source FIND_CHEAPER: each suggestion has a distinct sourceIndex → one search per item.
    const suggestionsWithIdx = (response.suggestions ?? []).filter((s) => typeof s.sourceIndex === 'number');
    const distinctIdx = new Set(suggestionsWithIdx.map((s) => s.sourceIndex as number));
    if (hasShoppingIntent && products.length === 0 && distinctIdx.size >= 2) {
      const ordered = Array.from(distinctIdx).sort((a, b) => a - b);
      setStatus(`${t('chat.status.searching', lang)} (${ordered.length})`);
      const groups = await Promise.all(
        ordered.map(async (idx) => {
          const s = suggestionsWithIdx.find((x) => x.sourceIndex === idx)!;
          const query = s.searchQuery || s.name;
          const items = await fetchProducts(query, resolvedMode, effectiveBudget);
          return { sourceIndex: idx, label: s.name || query, items };
        }),
      );
      productsByIndex = groups;
      products = groups.flatMap((g) => g.items.slice(0, 3));
    } else if (hasShoppingIntent && products.length === 0) {
      if ((resolvedMode === 'fashion' || resolvedMode === 'home') && response.suggestions?.length) {
        // One search per suggested piece; pick the cheapest match per query.
        // Prefer a color-qualified query so retailer thumbnails match the generated visual.
        const queries = response.suggestions.slice(0, 6);
        setStatus(`${t('chat.status.searching', lang)} (${queries.length})`);
        const results = await Promise.all(
          queries.map((s) => {
            const base = s.searchQuery || s.name;
            const q = s.color && !base.toLowerCase().includes(s.color.toLowerCase())
              ? `${s.color} ${base}`
              : base;
            return fetchProducts(q, resolvedMode, effectiveBudget);
          }),
        );
        const usedRetailers = new Set<string>();
        products = results
          .map((items, i) => {
            let chosen = items.find((it) => !usedRetailers.has(it.retailer) && isTrusted(it.retailer, it.link));
            if (!chosen) chosen = items.find((it) => !usedRetailers.has(it.retailer));
            if (!chosen) chosen = items[i % items.length];
            if (!chosen) chosen = items[0];
            if (!chosen) return null;
            usedRetailers.add(chosen.retailer);
            return { ...chosen, name: queries[i].name || chosen.name };
          })
          .filter((p): p is Product => p !== null);
      } else {
        const query =
          response.identifiedItem?.name ||
          response.suggestions?.[0]?.searchQuery ||
          '';
        if (query) {
          setStatus(`${t('chat.status.searchingQuery', lang).replace('{q}', query.slice(0, 60))}`);
          products = await fetchProducts(query, resolvedMode, effectiveBudget);
        }
      }

    }

    const kind: Message['kind'] | undefined = hasShoppingIntent
      ? (resolvedMode as Message['kind'])
      : undefined;

    const aiMsg: Message = {
      id: 'a' + Date.now().toString(36),
      role: 'ai',
      text: response.text,
      kind,
      response,
      products,
      productsByIndex,
    };
    const next = [...baseMessages, aiMsg];
    setMessages(next);
    persistChat(next);
  };

  const send = async () => {
    const text = input.trim();
    if (!text && pendingFiles.length === 0) return;
    setInput('');

    // Image(s) + optional text: call analyze
    if (pendingFiles.length > 0) {
      const files = pendingFiles;
      setPendingFiles([]);
      setAttachLimitNote(null);
      const userMsg: Message = {
        id: 'u' + Date.now().toString(36),
        role: 'user',
        text,
        attachments: files.map((f) => ({ kind: 'image', preview: f.preview })),
        attachment: files[0] ? { kind: 'image', preview: files[0].preview } : undefined,
      };
      const base = [...messages, userMsg];
      setMessages(base);
      setPending(true);
      setStatus(t('chat.status.analyzingImage', lang));
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: files[0].base64,
            mimeType: files[0].mimeType,
            images: files.map((f) => ({ base64: f.base64, mimeType: f.mimeType })),
            mode,
            language: lang,
            message: text || undefined,
            gender,
            budget,
            chatHistory: messages,
          }),
        });
        const data = (await res.json()) as StandardResponse | ApiErrorResponse;
        if (!res.ok) {
          const aiMsg: Message = {
            id: 'a' + Date.now().toString(36),
            role: 'ai',
            text: localizeApiError(data as ApiErrorResponse, lang),
          };
          const next = [...base, aiMsg];
          setMessages(next);
          persistChat(next);
          return;
        }
        setStatus(t('chat.status.thinking', lang));
        await handleResponse(data as StandardResponse, base, true);
      } catch {
        const aiMsg: Message = {
          id: 'a' + Date.now().toString(36),
          role: 'ai',
          text: t('chat.error.generic', lang),
        };
        const next = [...base, aiMsg];
        setMessages(next);
        persistChat(next);
      } finally {
        setPending(false);
        setStatus(null);
      }
      return;
    }

    // Text path (may contain 0..N URLs)
    const detectedUrls = extractUrls(text).slice(0, MAX_ATTACHMENTS);
    let resolvedProducts: ResolvedProduct[] = [];
    let attachments: Attachment[] | undefined;
    if (detectedUrls.length > 0) {
      attachments = detectedUrls.map((u) => ({ kind: 'link', label: u }));
      setResolving(true);
      setStatus(
        detectedUrls.length > 1
          ? t('chat.resolvingMulti', lang).replace('{n}', String(detectedUrls.length))
          : t('chat.status.resolving', lang),
      );
      const isDirectImageUrl = (u: string): boolean => {
        if (/\.(jpe?g|png|webp|gif|bmp|avif)(\?|#|$)/i.test(u)) return true;
        try {
          const host = new URL(u).hostname.toLowerCase();
          if (host.includes('gstatic.com')) return true;
          if (host.startsWith('encrypted-tbn')) return true;
          if (host.endsWith('.googleusercontent.com')) return true;
        } catch {
          /* ignore */
        }
        return false;
      };

      const callLens = async (imageUrl: string): Promise<Product[] | undefined> => {
        try {
          const lensRes = await fetch('/api/lens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl, language: lang }),
          });
          if (!lensRes.ok) return undefined;
          const lensData = (await lensRes.json()) as { products?: Product[] };
          return lensData.products && lensData.products.length > 0 ? lensData.products : undefined;
        } catch {
          return undefined;
        }
      };

      const results = await Promise.all(
        detectedUrls.map(async (u) => {
          if (isDirectImageUrl(u)) {
            const lensProducts = await callLens(u);
            if (!lensProducts || lensProducts.length === 0) return null;
            const title = lensProducts[0]?.name || 'Image';
            return { title, image: u, sourceUrl: u, lensProducts } as ResolvedProduct;
          }
          try {
            const res = await fetch('/api/resolve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: u }),
            });
            if (!res.ok) return null;
            const data = (await res.json()) as {
              title?: string;
              image?: string;
              jsonLd?: Record<string, unknown>;
              fallback?: boolean;
              error?: string;
            };
            if (data.error || !data.title) return null;
            const lensProducts = data.image ? await callLens(data.image) : undefined;
            return { title: data.title, image: data.image, jsonLd: data.jsonLd, sourceUrl: u, lensProducts } as ResolvedProduct;
          } catch {
            return null;
          }
        }),
      );
      results.forEach((r) => {
        if (r) resolvedProducts.push(r);
      });
      setResolving(false);
    }

    // Carry forward resolved products from the most recent user message if this
    // turn has no fresh resolves — supports the "ask intent → user picks chip" flow.
    if (resolvedProducts.length === 0) {
      const carried = [...messages].reverse().find(
        (m) => m.role === 'user' && (m.resolvedProducts?.length ?? 0) > 0,
      );
      if (carried?.resolvedProducts) {
        resolvedProducts = carried.resolvedProducts;
      }
    }

    const userMsg: Message = {
      id: 'u' + Date.now().toString(36),
      role: 'user',
      text,
      attachment: attachments?.[0],
      attachments,
      resolvedProducts: resolvedProducts.length ? resolvedProducts : undefined,
    };
    const base = [...messages, userMsg];
    setMessages(base);
    setPending(true);
    setStatus(t('chat.status.thinking', lang));

    const result = await callChat(text, resolvedProducts);
    if (!result.ok) {
      const aiMsg: Message = {
        id: 'a' + Date.now().toString(36),
        role: 'ai',
        text: result.message,
      };
      const next = [...base, aiMsg];
      setMessages(next);
      persistChat(next);
      setPending(false);
      setStatus(null);
      return;
    }
    await handleResponse(result.response, base, detectedUrls.length > 0);
    setPending(false);
    setStatus(null);
  };

  const onAttach = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert(t('chat.imageTooLarge', lang));
      return;
    }
    if (pendingFiles.length >= MAX_ATTACHMENTS) {
      setAttachLimitNote(t('chat.attachLimit', lang));
      return;
    }
    try {
      const { base64, mimeType } = await compressImage(file);
      const preview = `data:${mimeType};base64,${base64}`;
      setPendingFiles((prev) => {
        if (prev.length >= MAX_ATTACHMENTS) {
          setAttachLimitNote(t('chat.attachLimit', lang));
          return prev;
        }
        return [...prev, { base64, mimeType, preview }];
      });
      setAttachLimitNote(null);
    } catch {
      /* ignore */
    }
  };

  const onPromptClick = (m: Mode) => {
    setMode(m);
    const samples: Record<string, { en: string; tr: string }> = {
      price: {
        en: 'https://commonprojects.com/achilles-low — find this cheaper',
        tr: 'https://trendyol.com/sneaker — daha ucuzunu bul',
      },
      fashion: {
        en: 'Style this around a stone trench coat for autumn',
        tr: 'Bej trençkot etrafında sonbahar kombini kur',
      },
      home: {
        en: 'Furnish a small reading nook around a walnut chair',
        tr: 'Ceviz koltuk etrafında küçük bir okuma köşesi döşe',
      },
      electronics: {
        en: 'Compare Sony WH-1000XM5 to peers under €350',
        tr: 'Sony WH-1000XM5 modelini muadilleriyle karşılaştır',
      },
    };
    const text = samples[m]?.[lang] ?? '';
    setInput(text);
  };

  const newChat = () => {
    setMessages([]);
    setActiveId(null);
    setMode('auto');
    setInput('');
    setPrefsSummary('');
  };

  const selectChat = (id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;
    setActiveId(id);
    setMessages(chat.messages);
    setPrefsSummary(chat.prefsSummary ?? '');
  };

  const removeChat = (id: string) => {
    const next = deleteChat(chats, id);
    setChats(next);
    void saveUserState({ chats: next });
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
      setPrefsSummary('');
    }
  };

  const activeTitle = useMemo(() => {
    if (!activeId) return t('chat.title.new', lang);
    return chats.find((c) => c.id === activeId)?.title ?? t('chat.title.new', lang);
  }, [activeId, chats, lang]);

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div
        className={`oben-sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar
        chats={chats}
        activeId={activeId}
        onSelect={(id) => { selectChat(id); setSidebarOpen(false); }}
        onNew={() => { newChat(); setSidebarOpen(false); }}
        onDelete={removeChat}
        cartCount={cart.length}
        onOpenCart={() => { setCartOpen(true); setSidebarOpen(false); }}
        lang={lang}
        className={`oben-sidebar${sidebarOpen ? ' open' : ''}`}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <header
          className="oben-chat-header"
          style={{
            height: 54,
            flex: '0 0 54px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="oben-mobile-only"
              style={{
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                color: 'var(--ink)',
                flex: '0 0 32px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div
              className="oben-chat-header-title"
              style={{
                fontSize: 13.5,
                color: 'var(--ink)',
                fontWeight: 500,
                letterSpacing: '-.005em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {messages.length ? activeTitle : t('chat.title.new', lang)}
            </div>
          </div>
          <div className="oben-chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={() => setGenderModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                border: '1px solid var(--line)',
                background: 'var(--pill)',
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '-.005em',
                cursor: 'pointer',
              }}
              title={t('gender.chip', lang)}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              {gender ? GENDER_LABELS[gender][lang] : t('gender.chip', lang)}
            </button>
            <LanguageToggle lang={lang} onChange={setLang} />
            <SignedIn>
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Action
                    label={t('account.upgrade', lang)}
                    labelIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                    onClick={() => setUpgradeOpen(true)}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>
        </header>

        <section
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
        >
          {messages.length === 0 ? (
            <EmptyState lang={lang} onPromptClick={onPromptClick} />
          ) : (
            <div
              className="oben-chat-messages"
              style={{
                maxWidth: 780,
                margin: '8px auto 24px',
                width: '100%',
                padding: '0 28px',
              }}
            >
              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <UserMsg key={msg.id} msg={msg} />
                ) : (
                  <AIMsg key={msg.id}>
                    <p style={{ margin: '0 0 6px' }}>{msg.text}</p>
                    {(msg.kind === 'price' || msg.kind === 'electronics' || msg.kind === 'beauty') && msg.productsByIndex && msg.productsByIndex.length > 1 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                        {msg.productsByIndex.map((grp) => (
                          <div key={grp.sourceIndex}>
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '.12em',
                                fontWeight: 500,
                                marginBottom: 6,
                              }}
                            >
                              #{grp.sourceIndex + 1} · {grp.label}
                            </div>
                            <PriceCard
                              productName={grp.label}
                              retailers={grp.items}
                              onAdd={addProductToCart}
                              onOpenModal={() =>
                                setLinksOpen({ products: grp.items, name: grp.label })
                              }
                              lang={lang}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (msg.kind === 'price' || msg.kind === 'electronics' || msg.kind === 'beauty') && (msg.products?.length ?? 0) > 0 ? (
                      <PriceCard
                        productName={msg.response?.identifiedItem?.name}
                        retailers={msg.products ?? []}
                        onAdd={addProductToCart}
                        onOpenModal={() =>
                          setLinksOpen({
                            products: msg.products ?? [],
                            name: msg.response?.identifiedItem?.name ?? '',
                          })
                        }
                        lang={lang}
                      />
                    ) : (msg.kind === 'fashion' || msg.kind === 'home') && (msg.products?.length ?? 0) > 0 ? (
                      <LookCard
                        variant={msg.kind}
                        items={msg.products ?? []}
                        hasVisual={msg.response?.hasVisual}
                        suggestions={msg.response?.suggestions}
                        onAdd={addProductToCart}
                        onCompare={(p) => compareProduct(p, msg.kind as Mode)}
                        onOpenModal={() => {
                          const msgIdx = messages.findIndex((mm) => mm.id === msg.id);
                          let anchor: { imageBase64: string; mimeType: string; type?: string } | undefined;
                          for (let i = msgIdx - 1; i >= 0; i--) {
                            const m = messages[i];
                            if (m.role !== 'user' || m.attachment?.kind !== 'image' || !m.attachment.preview) continue;
                            const match = m.attachment.preview.match(/^data:([^;]+);base64,(.+)$/);
                            if (match) {
                              anchor = {
                                mimeType: match[1],
                                imageBase64: match[2],
                                type: msg.response?.identifiedItem?.type || msg.response?.identifiedItem?.name,
                              };
                            }
                            break;
                          }
                          if (plan !== 'pro') {
                            setUpgradeOpen(true);
                            return;
                          }
                          const pieces = msg.response?.suggestions
                            ?.map((s) => ({ description: s.visualDescription || s.name }))
                            .filter((p) => !!p.description);
                          setVisualOpen({
                            msgId: msg.id,
                            kind: msg.kind as 'fashion' | 'home',
                            description: msg.text,
                            items: msg.products ?? [],
                            imagePrompt: msg.response?.imagePrompt,
                            pieces,
                            anchor,
                          });
                        }}
                        lang={lang}
                      />
                    ) : null}
                    {msg.response?.comparison?.items?.length ? (
                      <ComparisonCard comparison={msg.response.comparison} lang={lang} />
                    ) : null}
                    {msg.response?.clarify?.groups?.length ? (
                      <div style={{ marginTop: 14 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '.12em',
                            fontWeight: 500,
                            marginBottom: 10,
                          }}
                        >
                          {t('clarify.prompt', lang)}
                        </div>
                        {msg.response.clarify.groups.map((grp, gi) => (
                          <div key={gi} style={{ marginBottom: 12 }}>
                            <div
                              style={{
                                fontSize: 12.5,
                                color: 'var(--ink)',
                                marginBottom: 6,
                                fontWeight: 500,
                                letterSpacing: '-.005em',
                              }}
                            >
                              {grp.question}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {grp.options.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => appendToInput(opt)}
                                  style={{
                                    padding: '5px 11px',
                                    borderRadius: 999,
                                    border: '1px solid var(--line)',
                                    background: 'var(--bg-soft)',
                                    fontSize: 12.5,
                                    color: 'var(--ink)',
                                    cursor: 'pointer',
                                    transition: 'border-color .14s, color .14s',
                                  }}
                                  onMouseEnter={(ev) => {
                                    ev.currentTarget.style.borderColor = 'var(--accent)';
                                    ev.currentTarget.style.color = 'var(--accent)';
                                  }}
                                  onMouseLeave={(ev) => {
                                    ev.currentTarget.style.borderColor = 'var(--line)';
                                    ev.currentTarget.style.color = 'var(--ink)';
                                  }}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        {msg.response.clarify.allowOther && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: 'var(--muted)',
                              fontStyle: 'italic',
                              marginTop: 2,
                            }}
                          >
                            {t('clarify.otherHint', lang)}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </AIMsg>
                ),
              )}
              {pending && <TypingDots label={status || t('chat.typing', lang)} />}
              {resolving && !pending && <TypingDots label={status || t('chat.fetchingProduct', lang)} />}
            </div>
          )}
        </section>

        <InputBar
          value={input}
          setValue={setInput}
          onSend={send}
          onAttach={onAttach}
          onClearFile={(idx) => {
            setAttachLimitNote(null);
            if (typeof idx === 'number') {
              setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
            } else {
              setPendingFiles([]);
            }
          }}
          pendingFilePreviews={pendingFiles.map((f) => f.preview)}
          attachLimitNote={attachLimitNote ?? undefined}
          lang={lang}
          resolving={resolving}
          budget={budget}
          onBudgetChange={updateBudget}
        />
      </main>

      {linksOpen && (
        <LinksModal
          productName={linksOpen.name}
          retailers={linksOpen.products}
          onClose={() => setLinksOpen(null)}
          onAdd={addProductToCart}
          onAddAll={() => linksOpen.products.forEach(addProductToCart)}
          lang={lang}
          loading={linksOpen.loading}
        />
      )}

      {visualOpen && (
        <VisualModal
          key={visualOpen.msgId}
          kind={visualOpen.kind}
          description={visualOpen.description}
          items={visualOpen.items}
          imagePrompt={visualOpen.imagePrompt}
          pieces={visualOpen.pieces}
          anchor={visualOpen.anchor}
          initialImage={imageMemo[visualOpen.msgId]}
          onGenerated={(b64) =>
            setImageMemo((prev) => ({ ...prev, [visualOpen.msgId]: b64 }))
          }
          onClose={() => setVisualOpen(null)}
          onAdd={addProductToCart}
          lang={lang}
        />
      )}

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onRemove={(id) => setCart((prev) => cartRemove(prev, id))}
        onClear={() => setCart([])}
        lang={lang}
      />

      {genderModalOpen && (
        <GenderModal
          lang={lang}
          current={gender}
          onSelect={updateGender}
          onClose={() => setGenderModalOpen(false)}
          showSkip={false}
        />
      )}

      {upgradeOpen && (
        <UpgradeModal
          lang={lang}
          currentPlan={plan}
          onClose={() => setUpgradeOpen(false)}
          onUpgrade={(p) => { setPlan(p); setPlanStorage(p); }}
        />
      )}
    </div>
  );
}
