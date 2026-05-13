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
import { getInitialLang, t } from '@/lib/i18n';
import { loadCart, saveCart, addToCart as cartAdd, removeFromCart as cartRemove } from '@/lib/cart';
import { loadChats, saveChats, makeChat, upsertChat } from '@/lib/chats';
import { compressImage, isUrl } from '@/lib/image';
import { mockProducts, inferMode } from '@/lib/mocks';
import type {
  CartItem,
  Chat,
  Lang,
  Message,
  Mode,
  Product,
  StandardResponse,
} from '@/lib/types';

const SUGGEST_PROMPTS = [
  { mode: 'price' as Mode, labelKey: 'prompt.price.label', exampleKey: 'prompt.price.example' },
  { mode: 'fashion' as Mode, labelKey: 'prompt.fashion.label', exampleKey: 'prompt.fashion.example' },
  { mode: 'home' as Mode, labelKey: 'prompt.home.label', exampleKey: 'prompt.home.example' },
  { mode: 'electronics' as Mode, labelKey: 'prompt.electronics.label', exampleKey: 'prompt.electronics.example' },
];

function EmptyState({
  lang,
  onPromptClick,
}: {
  lang: Lang;
  onPromptClick: (mode: Mode) => void;
}) {
  return (
    <div
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
        }}
      >
        {msg.attachment?.kind === 'image' && msg.attachment.preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={msg.attachment.preview}
            alt=""
            style={{
              display: 'block',
              maxWidth: 240,
              maxHeight: 240,
              borderRadius: 8,
              marginBottom: msg.text ? 8 : 0,
            }}
          />
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
        style={{
          fontSize: 11,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '.12em',
          fontWeight: 500,
          marginBottom: 10,
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
        {label}
      </div>
      <div className="oben-typing" aria-label={label}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<Mode>('auto');
  const [input, setInput] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [linksOpen, setLinksOpen] = useState<{ products: Product[]; name: string } | null>(null);
  const [visualOpen, setVisualOpen] = useState<{
    kind: 'fashion' | 'home';
    description: string;
    items: Product[];
    imagePrompt?: string;
  } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLang(getInitialLang());
    setCart(loadCart());
    setChats(loadChats());
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

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
        ? { ...existing, messages: msgs }
        : makeChat(firstUser, lang);
      if (!existing) setActiveId(chat.id);
    } else {
      chat = makeChat(firstUser, lang);
      chat.messages = msgs;
      setActiveId(chat.id);
    }
    const next = upsertChat(chats, chat);
    setChats(next);
    saveChats(next);
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
    resolvedProduct?: { title: string; image?: string; jsonLd?: Record<string, unknown> },
  ): Promise<StandardResponse | null> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          resolvedProduct,
          mode,
          chatHistory: messages,
          language: lang,
        }),
      });
      const data = (await res.json()) as StandardResponse;
      return data;
    } catch {
      return null;
    }
  };

  const fetchProducts = async (query: string, m: Mode): Promise<Product[]> => {
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode: m, language: lang }),
      });
      const data = (await res.json()) as { products: Product[] };
      return data.products ?? [];
    } catch {
      return [];
    }
  };

  const handleResponse = async (response: StandardResponse, baseMessages: Message[]) => {
    let resolvedMode = response.mode;
    if (resolvedMode === 'auto') {
      resolvedMode = inferMode(response.text);
    }
    const hasShoppingIntent =
      !!response.identifiedItem ||
      (response.suggestions?.length ?? 0) > 0 ||
      (response.retailers?.length ?? 0) > 0 ||
      response.hasVisual ||
      resolvedMode !== 'price';

    let products: Product[] = response.retailers ?? [];
    if (hasShoppingIntent && products.length === 0) {
      if ((resolvedMode === 'fashion' || resolvedMode === 'home') && response.suggestions?.length) {
        // One search per suggested piece; pick the cheapest match per query
        const queries = response.suggestions.slice(0, 6);
        const results = await Promise.all(
          queries.map((s) => fetchProducts(s.searchQuery || s.name, resolvedMode)),
        );
        const usedRetailers = new Set<string>();
        products = results
          .map((items, i) => {
            let chosen = items.find((it) => !usedRetailers.has(it.retailer));
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
        if (query) products = await fetchProducts(query, resolvedMode);
      }

      if (products.length === 0) {
        products = mockProducts(resolvedMode, lang);
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
    };
    const next = [...baseMessages, aiMsg];
    setMessages(next);
    persistChat(next);
  };

  const send = async () => {
    const text = input.trim();
    if (!text && !pendingFile) return;
    setInput('');

    // Image + optional text: call analyze
    if (pendingFile) {
      const file = pendingFile;
      setPendingFile(null);
      const userMsg: Message = {
        id: 'u' + Date.now().toString(36),
        role: 'user',
        text,
        attachment: { kind: 'image', preview: file.preview },
      };
      const base = [...messages, userMsg];
      setMessages(base);
      setPending(true);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: file.base64, mimeType: file.mimeType, mode, language: lang, message: text || undefined }),
        });
        const data = (await res.json()) as StandardResponse;
        setPending(false);
        await handleResponse(data, base);
      } catch {
        setPending(false);
      }
      return;
    }

    // Text-only path
    let attachment: Message['attachment'];
    let resolvedProduct: { title: string; image?: string; jsonLd?: Record<string, unknown> } | undefined;
    if (isUrl(text)) {
      attachment = { kind: 'link', label: text };
      setResolving(true);
      try {
        const res = await fetch('/api/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: text }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            title?: string;
            image?: string;
            jsonLd?: Record<string, unknown>;
            error?: string;
          };
          if (!data.error && data.title) {
            resolvedProduct = { title: data.title, image: data.image, jsonLd: data.jsonLd };
          }
        }
      } catch { /* ignore */ }
      setResolving(false);
    }

    const userMsg: Message = {
      id: 'u' + Date.now().toString(36),
      role: 'user',
      text,
      attachment,
    };
    const base = [...messages, userMsg];
    setMessages(base);
    setPending(true);

    const response = await callChat(text, resolvedProduct);
    setPending(false);
    if (!response) return;
    await handleResponse(response, base);
  };

  const onAttach = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert(t('chat.imageTooLarge', lang));
      return;
    }
    try {
      const { base64, mimeType } = await compressImage(file);
      const preview = `data:${mimeType};base64,${base64}`;
      setPendingFile({ base64, mimeType, preview });
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
  };

  const selectChat = (id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;
    setActiveId(id);
    setMessages(chat.messages);
  };

  const activeTitle = useMemo(() => {
    if (!activeId) return t('chat.title.new', lang);
    return chats.find((c) => c.id === activeId)?.title ?? t('chat.title.new', lang);
  }, [activeId, chats, lang]);

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Sidebar
        chats={chats}
        activeId={activeId}
        onSelect={selectChat}
        onNew={newChat}
        cartCount={cart.length}
        onOpenCart={() => setCartOpen(true)}
        lang={lang}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <header
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
          <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500, letterSpacing: '-.005em' }}>
            {messages.length ? activeTitle : t('chat.title.new', lang)}
          </div>
          <LanguageToggle lang={lang} onChange={setLang} />
        </header>

        <section
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
        >
          {messages.length === 0 ? (
            <EmptyState lang={lang} onPromptClick={onPromptClick} />
          ) : (
            <div
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
                    {msg.kind === 'price' || msg.kind === 'electronics' || msg.kind === 'beauty' ? (
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
                    ) : msg.kind === 'fashion' || msg.kind === 'home' ? (
                      <LookCard
                        variant={msg.kind}
                        description={msg.text}
                        items={msg.products ?? []}
                        onAdd={addProductToCart}
                        onOpenModal={() =>
                          setVisualOpen({
                            kind: msg.kind as 'fashion' | 'home',
                            description: msg.text,
                            items: msg.products ?? [],
                            imagePrompt: msg.response?.imagePrompt,
                          })
                        }
                        lang={lang}
                      />
                    ) : null}
                  </AIMsg>
                ),
              )}
              {pending && <TypingDots label={t('chat.typing', lang)} />}
              {resolving && !pending && <TypingDots label={t('chat.fetchingProduct', lang)} />}
            </div>
          )}
        </section>

        <InputBar
          mode={mode}
          setMode={setMode}
          value={input}
          setValue={setInput}
          onSend={send}
          onAttach={onAttach}
          onClearFile={() => setPendingFile(null)}
          pendingFilePreview={pendingFile?.preview}
          lang={lang}
          resolving={resolving}
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
        />
      )}

      {visualOpen && (
        <VisualModal
          kind={visualOpen.kind}
          description={visualOpen.description}
          items={visualOpen.items}
          imagePrompt={visualOpen.imagePrompt}
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
    </div>
  );
}
