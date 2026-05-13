// ============================================================
// OBEN — Chat app shell. Sidebar + main pane + input bar.
// Demo-level interactivity: send messages, switch modes,
// open all 3 modals, cart updates.
// ============================================================

const { useState: useS, useEffect: useE, useRef: useR } = React;
const e = React.createElement;

// ---------- Global styles (injected once) ----------
const GlobalStyle = () => (
  <style>{`
    @keyframes oben-fade { from{opacity:0} to{opacity:1} }
    @keyframes oben-typ  { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
    .oben-msg-in { opacity: 1 }
    .oben-typing span { display:inline-block; width:5px; height:5px; border-radius:50%; background:#9A9A93; margin:0 2px; animation: oben-typ 1.1s infinite; }
    .oben-typing span:nth-child(2){ animation-delay:.15s }
    .oben-typing span:nth-child(3){ animation-delay:.3s }
    .oben-input::placeholder{ color:#9A9A93 }
    .oben-history-item:hover{ background:#F4F1EA !important }
    .oben-mode-btn:hover{ color: var(--ink) }
  `}</style>
);

// ============================================================
// LOGO
// ============================================================
const Logo = ({ size = 18 }) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:9, fontSize:size, fontWeight:500, letterSpacing:'.02em', color:'var(--ink)'}}>
    <span style={{
      width:22,height:22,borderRadius:'50%',
      border:'1.25px solid var(--ink)',
      display:'grid',placeItems:'center', fontSize:11, fontWeight:500,
    }}>O</span>
    OBEN
  </span>
);

// ============================================================
// SIDEBAR
// ============================================================
const Sidebar = ({ chats, activeId, onSelect, onNew, cartCount, onOpenCart }) => {
  return (
    <aside style={{
      width:240, flex:'0 0 240px',
      background:'var(--bg-soft)',
      borderRight:'1px solid var(--line)',
      display:'flex',flexDirection:'column',
      height:'100%',
    }}>
      {/* Logo */}
      <div style={{padding:'20px 20px 14px'}}>
        <a href="landing.html"><Logo /></a>
      </div>

      {/* New chat */}
      <div style={{padding:'4px 12px 6px'}}>
        <button onClick={onNew} style={{
          width:'100%',
          display:'flex',alignItems:'center',gap:10,
          padding:'9px 10px',
          fontSize:13, fontWeight:500,
          borderRadius:5,
          color:'var(--ink)',
          transition:'background .12s',
        }} onMouseEnter={e=>e.currentTarget.style.background='#F4F1EA'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <span style={{width:14,height:14,color:'var(--muted)',display:'inline-flex'}}>{I.pen}</span>
          New chat
        </button>
      </div>

      {/* Divider */}
      <div style={{height:1, background:'var(--line-soft)', margin:'8px 16px 4px'}}/>

      {/* History */}
      <div style={{padding:'10px 12px 4px', fontSize:10.5, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, paddingLeft:18}}>Recent</div>
      <div style={{flex:1, overflowY:'auto', padding:'2px 8px'}}>
        {chats.map(c => (
          <button key={c.id} className="oben-history-item"
            onClick={() => onSelect(c.id)}
            style={{
              width:'100%',
              display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'7px 10px',
              borderRadius:4,
              fontSize:12.5,
              color: activeId === c.id ? 'var(--ink)' : 'var(--muted)',
              background: activeId === c.id ? '#F4F1EA' : 'transparent',
              fontWeight: activeId === c.id ? 500 : 400,
              textAlign:'left',
              transition:'background .1s, color .1s',
            }}>
            <span style={{
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{c.title}</span>
          </button>
        ))}
      </div>

      {/* Bottom: cart */}
      <div style={{borderTop:'1px solid var(--line-soft)', padding:'10px 12px 14px'}}>
        <button onClick={onOpenCart} style={{
          width:'100%',
          display:'flex',alignItems:'center',gap:10,
          padding:'9px 10px',
          fontSize:13, fontWeight:500,
          borderRadius:5,
          color:'var(--ink)',
          transition:'background .12s',
          position:'relative',
        }} onMouseEnter={e=>e.currentTarget.style.background='#F4F1EA'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <span style={{width:15,height:15,color:'var(--muted)',display:'inline-flex'}}>{I.cart}</span>
          Cart
          {cartCount > 0 && (
            <span style={{
              marginLeft:'auto',
              minWidth:20, height:20, borderRadius:10, padding:'0 6px',
              background:'var(--accent)', color:'#FAFAF8',
              fontSize:11, fontWeight:500, fontVariantNumeric:'tabular-nums',
              display:'inline-flex',alignItems:'center',justifyContent:'center',
            }}>{cartCount}</span>
          )}
        </button>
      </div>
    </aside>
  );
};

// ============================================================
// TOP BAR
// ============================================================
const TopBar = ({ title }) => (
  <header style={{
    height:54, flex:'0 0 54px',
    borderBottom:'1px solid var(--line)',
    background:'var(--bg)',
    display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'0 28px',
  }}>
    <div style={{fontSize:13.5, color:'var(--ink)', fontWeight:500, letterSpacing:'-.005em'}}>
      {title}
    </div>
    <div /* intentionally empty */ />
  </header>
);

// ============================================================
// CHAT MESSAGES — empty state + sent messages
// ============================================================
const EmptyState = ({ onPromptClick, accent, appName, headline }) => (
  <div style={{
    minHeight:'100%',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    padding:'56px 24px 40px',
  }}>
    <div style={{
      fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.16em',fontWeight:500,
      marginBottom:18,
    }}>
      <span style={{display:'inline-block',width:5,height:5,borderRadius:'50%',background:accent,marginRight:8,verticalAlign:'middle',transform:'translateY(-1px)'}}/>
      A shopping concierge
    </div>
    <h1 style={{
      fontSize:'clamp(34px, 4.2vw, 52px)',
      fontWeight:500,
      letterSpacing:'-.035em',
      lineHeight:1.02,
      margin:'0 0 14px',
      textAlign:'center',
      maxWidth:760, textWrap:'balance',
    }}>What are you shopping for?</h1>
    <p style={{
      margin:'0 0 36px',
      maxWidth:560, textAlign:'center',
      fontSize:15, color:'var(--muted)', lineHeight:1.5, textWrap:'balance',
    }}>{headline}</p>

    <div style={{
      display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 280px))', gap:10,
      width:'100%', maxWidth:600,
    }}>
      {SUGGEST_PROMPTS.map(p => (
        <button key={p.mode} onClick={() => onPromptClick(p)}
          style={{
            textAlign:'left',
            padding:'13px 14px',
            border:'1px solid var(--line)',
            borderRadius:6,
            background:'var(--bg-soft)',
            transition:'border-color .14s, background .14s',
          }}
          onMouseEnter={ev=>{ ev.currentTarget.style.borderColor = '#CFCBC0'; ev.currentTarget.style.background='#FFF'; }}
          onMouseLeave={ev=>{ ev.currentTarget.style.borderColor = 'var(--line)'; ev.currentTarget.style.background='var(--bg-soft)'; }}>
          <div style={{fontSize:13.5,fontWeight:500,letterSpacing:'-.005em',marginBottom:3}}>{p.label}</div>
          <div style={{fontSize:12, color:'var(--muted)'}}>{p.example}</div>
        </button>
      ))}
    </div>
  </div>
);

// ---------- User message bubble ----------
const UserMsg = ({ text }) => (
  <div className="oben-msg-in" style={{display:'flex',justifyContent:'flex-end',padding:'14px 0'}}>
    <div style={{
      background:'#F0F0EE',
      color:'var(--ink)',
      padding:'10px 16px',
      borderRadius:18,
      maxWidth:'70%',
      fontSize:14.5,
      lineHeight:1.45,
      letterSpacing:'-.005em',
      whiteSpace:'pre-wrap',
      textWrap:'pretty',
    }}>{text}</div>
  </div>
);

// ---------- AI message (no bubble, generous breathing room, optional card) ----------
const AIMsg = ({ children }) => (
  <div className="oben-msg-in" style={{padding:'20px 0 8px',maxWidth:'88%'}}>
    <div style={{
      display:'inline-flex',alignItems:'center',gap:8,
      fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.12em',fontWeight:500,
      marginBottom:12,
    }}>
      <span style={{width:5,height:5,borderRadius:'50%',background:'var(--accent)'}}/>
      OBEN
    </div>
    <div style={{fontSize:15, lineHeight:1.6, color:'var(--ink)', letterSpacing:'-.005em', textWrap:'pretty'}}>
      {children}
    </div>
  </div>
);

const TypingDots = () => (
  <div className="oben-msg-in" style={{padding:'18px 0'}}>
    <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.12em',fontWeight:500,marginBottom:10}}>
      <span style={{display:'inline-block',width:5,height:5,borderRadius:'50%',background:'var(--accent)',marginRight:8,verticalAlign:'middle',transform:'translateY(-1px)'}}/>
      OBEN
    </div>
    <div className="oben-typing" aria-label="OBEN is typing"><span/><span/><span/></div>
  </div>
);

// ============================================================
// INPUT BAR (mode pills + textarea + actions)
// ============================================================
const InputBar = ({ mode, setMode, value, setValue, onSend, accent }) => {
  const taRef = useR(null);
  useE(() => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [value]);

  const submit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div style={{padding:'12px 28px 18px', background:'var(--bg)'}}>
      <div style={{
        maxWidth:780, margin:'0 auto',
        background:'var(--bg-soft)',
        border:'1px solid var(--line)',
        borderRadius:6,
        boxShadow:'var(--shadow)',
        overflow:'hidden',
      }}>
        {/* Mode pills row */}
        <div style={{
          display:'flex',alignItems:'center',gap:2,
          padding:'8px 10px 4px',
          borderBottom:'1px dashed var(--line-soft)',
        }}>
          {MODES.map(m => {
            const active = m.id === mode;
            return (
              <button key={m.id} className="oben-mode-btn" onClick={() => setMode(m.id)} style={{
                padding:'5px 11px',
                borderRadius:4,
                fontSize:12.5, fontWeight: active ? 500 : 400,
                color: active ? '#FAFAF8' : 'var(--muted)',
                background: active ? accent : 'transparent',
                letterSpacing:'.005em',
                transition:'all .14s',
              }}>{m.label}</button>
            );
          })}
          <div style={{flex:1}}/>
          <span style={{fontSize:11, color:'var(--muted-2)', letterSpacing:'.04em', paddingRight:6, fontWeight:500}}>
            ⌘ + Enter to send
          </span>
        </div>

        {/* Input row */}
        <div style={{display:'flex',alignItems:'flex-end',gap:10, padding:'10px 12px 10px'}}>
          <textarea
            ref={taRef}
            className="oben-input"
            placeholder="Paste a link or describe a product…"
            value={value}
            onChange={e=>setValue(e.target.value)}
            onKeyDown={e=>{
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                e.preventDefault(); submit();
              }
            }}
            rows={1}
            style={{
              flex:1, resize:'none',
              padding:'8px 6px',
              fontSize:14.5, lineHeight:1.5,
              color:'var(--ink)',
              minHeight:36, maxHeight:140,
              letterSpacing:'-.005em',
              outline:'none',
              background:'transparent',
              border:0,
            }}/>
          <div style={{display:'flex',alignItems:'center',gap:4, paddingBottom:2}}>
            <button title="Attach photo" style={{
              width:32,height:32,display:'grid',placeItems:'center',
              color:'var(--muted)',borderRadius:4,transition:'background .12s,color .12s'
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='#F4F1EA';e.currentTarget.style.color='var(--ink)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--muted)'}}>
              <span style={{width:16,height:16}}>{I.paperclip}</span>
            </button>
            <button title="Send" onClick={submit} disabled={!value.trim()} style={{
              width:32,height:32,display:'grid',placeItems:'center',
              borderRadius:4,
              background: value.trim() ? accent : '#E5E5E5',
              color: value.trim() ? '#FAFAF8' : '#9A9A93',
              transition:'background .14s',
            }}>
              <span style={{width:15,height:15}}>{I.arrowUp}</span>
            </button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:780,margin:'8px auto 0',textAlign:'center',fontSize:11,color:'var(--muted-2)',letterSpacing:'.01em'}}>
        OBEN can be wrong about prices and availability. Verify on the retailer's site.
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
const App = () => {
  // Tweaks
  const TWEAK_DEFAULTS = JSON.parse(document.getElementById('tweak-defaults').textContent
    .replace(/\/\*EDITMODE-(BEGIN|END)\*\//g,''));
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent CSS var
  useE(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);

  const [mode, setMode] = useS('auto');
  const [input, setInput] = useS('');
  const [activeChat, setActiveChat] = useS('c1');
  const [messages, setMessages] = useS([]);  // empty by default
  const [pendingCard, setPendingCard] = useS(false);

  // Modals
  const [linksOpen, setLinksOpen] = useS(false);
  const [visualOpen, setVisualOpen] = useS(null); // 'fashion' | 'home' | null
  const [cartOpen, setCartOpen] = useS(false);

  // Cart
  const [cart, setCart] = useS(INITIAL_CART);
  const addToCart = (it) => {
    if (cart.find(c => c.id === it.id)) return;
    setCart(prev => [...prev, { id: it.id || ('c'+Date.now()), name: it.name, retailer: it.retailer || it.name, price: it.price, asset: it.asset || 'sneaker' }]);
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart = () => setCart([]);
  const addAllFromPrice = () => {
    PRICE_RETAILERS.slice(0,3).forEach(r => addToCart({
      id:'p_'+r.id, name: HERO_PRODUCT.name, retailer: r.name, price: r.price, asset: HERO_PRODUCT.asset,
    }));
  };

  // Scroll
  const scrollRef = useR(null);
  useE(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pendingCard]);

  // ---------- Send a message ----------
  const send = (text) => {
    const userMsg = { id: 'u'+Date.now(), role:'user', text };
    setMessages(prev => [...prev, userMsg]);
    setPendingCard(true);

    // Decide AI reply by mode (auto = infer from text)
    setTimeout(() => {
      const effectiveMode = mode === 'auto' ? inferMode(text) : mode;
      const aiMsg = buildAIReply(effectiveMode, text);
      setMessages(prev => [...prev, aiMsg]);
      setPendingCard(false);
    }, 900);
  };

  const inferMode = (text) => {
    const t = text.toLowerCase();
    if (/(price|cheaper|cheapest|discount|deal|compare)/.test(t)) return 'price';
    if (/(outfit|look|wear|style|trouser|shirt|dress|coat|jacket|shoe|sneaker|bag)/.test(t)) return 'fashion';
    if (/(room|sofa|chair|lamp|rug|home|decor|living|kitchen|bedroom)/.test(t)) return 'home';
    if (/(headphone|laptop|phone|tv|speaker|camera|watch|electronic)/.test(t)) return 'price';
    if (/(skincare|cream|serum|makeup|lipstick|fragrance|beauty)/.test(t)) return 'price';
    return 'price';
  };

  const buildAIReply = (m, text) => {
    if (m === 'fashion') return {
      id:'a'+Date.now(), role:'ai', kind:'fashion',
      text:'Built around a stone trench coat — neutral, off-duty, with one warm accent. Heres a six-piece take.',
    };
    if (m === 'home') return {
      id:'a'+Date.now(), role:'ai', kind:'home',
      text:'A quiet reading nook with warm wood and one terracotta moment. Sized for a 12–14 m² room.',
    };
    // default: price
    return {
      id:'a'+Date.now(), role:'ai', kind:'price',
      text:'Found this exact model at six retailers. Cheapest is Mr Porter — €189 with free 3-day shipping.',
    };
  };

  const onPromptClick = (p) => {
    setMode(p.mode);
    const samples = {
      price:'https://commonprojects.com/achilles-low-bone-42 — find this cheaper',
      fashion:'Style this around a stone trench coat for autumn',
      home:'Furnish a small reading nook around a walnut chair',
      electronics:'Compare Sony WH-1000XM5 to peers under €350',
    };
    send(samples[p.mode] || 'Find this cheaper');
  };

  const newChat = () => {
    setMessages([]);
    setInput('');
    setMode('auto');
  };

  const activeTitle = DEMO_CHATS.find(c => c.id === activeChat)?.title || 'New chat';

  return (
    <div style={{display:'flex', height:'100%', position:'relative'}}>
      <GlobalStyle />

      <Sidebar
        chats={DEMO_CHATS}
        activeId={activeChat}
        onSelect={setActiveChat}
        onNew={newChat}
        cartCount={cart.length}
        onOpenCart={() => setCartOpen(true)}
      />

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, height:'100%'}}>
        <TopBar title={messages.length ? activeTitle : 'New chat'} />

        <section ref={scrollRef} style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column'}}>
          {messages.length === 0 ? (
            <EmptyState
              onPromptClick={onPromptClick}
              accent={t.accent}
              appName={t.appName}
              headline={t.headline}
            />
          ) : (
            <div style={{maxWidth:780, margin:'8px auto 24px', width:'100%', padding:'0 28px'}}>
              {messages.map(msg => msg.role === 'user' ? (
                <UserMsg key={msg.id} text={msg.text} />
              ) : (
                <AIMsg key={msg.id}>
                  <p style={{margin:'0 0 6px', textWrap:'pretty'}}>{msg.text}</p>
                  {msg.kind === 'price' && (
                    <PriceCard
                      product={HERO_PRODUCT}
                      retailers={PRICE_RETAILERS}
                      onAdd={(r) => addToCart({ id:'p_'+r.id, name:HERO_PRODUCT.name, retailer:r.name, price:r.price, asset:HERO_PRODUCT.asset })}
                      onOpenModal={() => setLinksOpen(true)}
                    />
                  )}
                  {msg.kind === 'fashion' && (
                    <FashionCard
                      look={FASHION_LOOK}
                      onAdd={addToCart}
                      onOpenModal={() => setVisualOpen('fashion')}
                    />
                  )}
                  {msg.kind === 'home' && (
                    <HomeCard
                      look={HOME_LOOK}
                      onAdd={addToCart}
                      onOpenModal={() => setVisualOpen('home')}
                    />
                  )}
                </AIMsg>
              ))}
              {pendingCard && <TypingDots />}
            </div>
          )}
        </section>

        <InputBar mode={mode} setMode={setMode} value={input} setValue={setInput} onSend={send} accent={t.accent} />
      </main>

      {/* Modals */}
      {linksOpen && (
        <LinksModal
          product={HERO_PRODUCT}
          retailers={PRICE_RETAILERS}
          onClose={() => setLinksOpen(false)}
          onAdd={(r) => addToCart({ id:'p_'+r.id, name:HERO_PRODUCT.name, retailer:r.name, price:r.price, asset:HERO_PRODUCT.asset })}
          onAddAll={addAllFromPrice}
        />
      )}
      {visualOpen && (
        <VisualModal
          kind={visualOpen}
          look={visualOpen === 'fashion' ? FASHION_LOOK : HOME_LOOK}
          onClose={() => setVisualOpen(null)}
          onAdd={addToCart}
        />
      )}

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onClear={clearCart}
      />

      {/* Tweaks Panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand">
          <TweakColor label="Accent" value={t.accent}
            onChange={v => setTweak('accent', v)}
            options={['#7C2D12', '#1F2A26', '#1E40AF', '#111111', '#9A6E33']} />
          <TweakText label="App name" value={t.appName} onChange={v => setTweak('appName', v)} />
        </TweakSection>
        <TweakSection label="Empty state">
          <TweakText label="Headline" value={t.headline} onChange={v => setTweak('headline', v)} />
        </TweakSection>
        <TweakSection label="Demo shortcuts">
          <TweakButton label="Open Links modal" onClick={() => setLinksOpen(true)} />
          <TweakButton label="Open Fashion modal" onClick={() => setVisualOpen('fashion')} />
          <TweakButton label="Open Home modal" onClick={() => setVisualOpen('home')} />
          <TweakButton label="Open Cart drawer" onClick={() => setCartOpen(true)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
