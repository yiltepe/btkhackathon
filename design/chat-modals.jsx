// ============================================================
// OBEN — 3 modals: Links, Visual, Cart Drawer
// ============================================================

const { useState: useStateM, useEffect: useEffectM } = React;

// ---------- Overlay ----------
const Overlay = ({ onClose, children, dim = .35 }) => {
  useEffectM(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position:'fixed',inset:0,
      background:`rgba(20,18,16,${dim})`,
      display:'grid',placeItems:'center',
      zIndex:100,
    }}>
      <div onClick={e=>e.stopPropagation()}>{children}</div>
    </div>
  );
};

// ============================================================
// 1) LINKS MODAL
// ============================================================
const LinksModal = ({ product, retailers, onClose, onAdd, onAddAll }) => {
  const [sort, setSort] = useStateM('price');
  const sorted = [...retailers].sort((a,b) => {
    if (sort === 'price') return a.price - b.price;
    if (sort === 'delivery') return (a.ship.includes('Free') ? 0 : 1) - (b.ship.includes('Free') ? 0 : 1) || a.price - b.price;
    if (sort === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <Overlay onClose={onClose}>
      <div style={{
        width:580,maxWidth:'92vw',
        background:'var(--bg-soft)',
        border:'1px solid var(--line)',
        borderRadius:6,
        boxShadow:'var(--shadow-modal)',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px 16px', borderBottom:'1px solid var(--line-soft)', display:'flex',alignItems:'center',gap:14}}>
          <Product kind={product.asset} size={48} bg="#F4F1EA" />
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Find a retailer</div>
            <div style={{fontSize:15, fontWeight:500, letterSpacing:'-.01em'}}>{product.name}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{width:30,height:30,display:'grid',placeItems:'center',color:'var(--muted)',borderRadius:4}}>
            <span style={{width:16,height:16,display:'inline-flex'}}>{I.close}</span>
          </button>
        </div>

        {/* Sort */}
        <div style={{padding:'10px 16px 0',display:'flex',justifyContent:'flex-end'}}>
          <div style={{display:'inline-flex',background:'#F4F1EA',borderRadius:5,padding:2}}>
            {[['price','Price'],['delivery','Delivery'],['rating','Rating']].map(([k,l]) => (
              <button key={k} onClick={()=>setSort(k)} style={{
                padding:'5px 11px',borderRadius:4,fontSize:11.5,fontWeight:500,
                letterSpacing:'.02em',
                background: sort===k ? '#FFFFFF' : 'transparent',
                color: sort===k ? 'var(--ink)' : 'var(--muted)',
                boxShadow: sort===k ? '0 1px 2px rgba(0,0,0,.04)' : 'none',
                transition:'all .12s',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{padding:'6px 10px 6px'}}>
          {sorted.map((r,i) => (
            <LinkRow key={r.id} r={r} highlight={sort==='price' && i===0} onAdd={()=>onAdd(r)} />
          ))}
        </div>

        {/* Footer */}
        <div style={{padding:'14px 22px 16px', borderTop:'1px solid var(--line-soft)', display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:12,color:'var(--muted)'}}>{retailers.length} retailers · prices last checked 4m ago</span>
          <button onClick={onAddAll} style={{fontSize:13,fontWeight:500,color:'var(--ink)',display:'inline-flex',gap:6,alignItems:'center'}}>
            <span style={{width:14,height:14,display:'inline-flex',color:'var(--accent)'}}>{I.plus}</span>
            Add all to cart
          </button>
        </div>
      </div>
    </Overlay>
  );
};

const LinkRow = ({ r, highlight, onAdd }) => {
  const [hov, setHov] = useStateM(false);
  const [added, setAdded] = useStateM(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      display:'grid',
      gridTemplateColumns:'1.2fr .7fr 1fr auto auto',
      alignItems:'center',
      gap:10,
      padding:'12px 12px',
      borderRadius:4,
      background: hov ? '#F6F5F1' : 'transparent',
      fontSize:13.5,
    }}>
      <div style={{display:'flex',alignItems:'center',gap:11}}>
        <span style={{width:26,height:26,borderRadius:'50%',background:'#F4F1EA',color:'#5C3F1E',
          display:'grid',placeItems:'center',fontSize:10,fontWeight:500}}>
          {r.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
        </span>
        <span style={{fontWeight: highlight ? 500 : 400}}>{r.name}</span>
        <span style={{fontSize:11,color:'var(--muted-2)',display:'inline-flex',alignItems:'center',gap:2,marginLeft:'auto'}}>
          <span style={{width:11,height:11,color:'#C8A268'}}>{I.star}</span>{r.rating}
        </span>
      </div>
      <span style={{textAlign:'right',fontWeight:500,fontVariantNumeric:'tabular-nums',color: highlight ? 'var(--accent)' : 'var(--ink)'}}>€{r.price.toFixed(0)}</span>
      <span style={{color:'var(--muted)',paddingLeft:14, display:'inline-flex',alignItems:'center',gap:5}}>
        <span style={{width:13,height:13}}>{I.truck}</span>{r.ship}
      </span>
      <a href="#" onClick={e=>e.preventDefault()} style={{paddingLeft:8,fontSize:13,display:'inline-flex',alignItems:'center',gap:4}}>
        Visit <span style={{width:13,height:13}}>{I.arrowRight}</span>
      </a>
      <button
        title="Add to cart"
        onClick={() => { setAdded(true); onAdd(); setTimeout(()=>setAdded(false),1200); }}
        style={{
          width:28,height:28,borderRadius:4,
          color: added ? 'var(--accent)' : 'var(--muted)',
          border:'1px solid '+ (hov ? 'var(--line)' : 'transparent'),
          background: hov ? '#FFFFFF' : 'transparent',
          display:'grid',placeItems:'center',transition:'all .14s',
        }}>
        <span style={{width:14,height:14}}>{added ? I.check : I.plus}</span>
      </button>
    </div>
  );
};

// ============================================================
// 2) VISUAL MODAL — generated outfit / room photo
// ============================================================
const VisualModal = ({ kind, look, onClose, onAdd }) => {
  const isFashion = kind === 'fashion';

  return (
    <Overlay onClose={onClose}>
      <div style={{
        width:880,maxWidth:'94vw',
        background:'var(--bg-soft)',
        border:'1px solid var(--line)',
        borderRadius:6,
        boxShadow:'var(--shadow-modal)',
        overflow:'hidden',
        position:'relative',
      }}>
        {/* top bar */}
        <div style={{
          position:'absolute',top:0,left:0,right:0,
          padding:'14px 18px',
          display:'flex',justifyContent:'space-between',alignItems:'center',
          zIndex:2,pointerEvents:'none',
        }}>
          <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',fontWeight:500, pointerEvents:'auto'}}>
            {isFashion ? 'Generated look · 01 / 03' : 'Generated room · 01 / 03'}
          </div>
          <div style={{display:'flex',gap:6,pointerEvents:'auto'}}>
            <button title="Download" style={{width:32,height:32,display:'grid',placeItems:'center',color:'var(--muted)',borderRadius:4}}>
              <span style={{width:15,height:15}}>{I.download}</span>
            </button>
            <button onClick={onClose} title="Close" style={{width:32,height:32,display:'grid',placeItems:'center',color:'var(--muted)',borderRadius:4}}>
              <span style={{width:15,height:15}}>{I.close}</span>
            </button>
          </div>
        </div>

        {/* big image */}
        <div style={{
          background:'#EFEAE0',
          padding:'72px 60px 56px',
          display:'grid',placeItems:'center',
          borderBottom:'1px solid var(--line-soft)',
        }}>
          {isFashion ? <FashionHero look={look} /> : <RoomHero look={look} />}
        </div>

        {/* item strip */}
        <div style={{padding:'14px 16px 18px'}}>
          <div style={{
            fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',fontWeight:500,
            padding:'4px 4px 10px',
          }}>Pieces in this {isFashion ? 'look' : 'room'} — {look.items.length}</div>
          <div style={{display:'flex',gap:10,overflowX:'auto'}}>
            {look.items.map(it => <VisualChip key={it.id} item={it} onAdd={()=>onAdd(it)} />)}
          </div>
        </div>
      </div>
    </Overlay>
  );
};

const VisualChip = ({ item, onAdd }) => {
  const [hov, setHov] = useStateM(false);
  const [added, setAdded] = useStateM(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        flex:'0 0 auto', width:172,
        border:'1px solid var(--line)',
        background: hov ? '#FFFFFF' : 'var(--bg)',
        borderRadius:6, padding:11, position:'relative',
        transition:'all .14s',
        borderColor: hov ? '#D5D2C9' : 'var(--line)',
      }}>
      <Product kind={item.asset} size={150} bg="#F4F1EA" />
      <div style={{marginTop:10,fontSize:13,lineHeight:1.35,fontWeight:500}}>{item.name}</div>
      <div style={{marginTop:3,fontSize:11.5,color:'var(--muted)'}}>{item.retailer}</div>
      <div style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <a href="#" onClick={e=>e.preventDefault()} style={{fontSize:11.5,color:'var(--muted)',display:'inline-flex',alignItems:'center',gap:3}}>
          Find similar <span style={{width:11,height:11}}>{I.arrowRight}</span>
        </a>
        <span style={{fontSize:13,fontWeight:500,fontVariantNumeric:'tabular-nums'}}>€{item.price}</span>
      </div>
      <button
        title="Add to cart"
        onClick={() => { setAdded(true); onAdd(); setTimeout(()=>setAdded(false),1200); }}
        style={{
          position:'absolute',top:9,right:9,
          width:26,height:26,borderRadius:'50%',
          border:'1px solid var(--line)', background:'#FFFFFF',
          color: added ? 'var(--accent)' : 'var(--ink)',
          display:'grid',placeItems:'center',
          opacity: hov || added ? 1 : 0,
          transition:'opacity .15s',
        }}>
        <span style={{width:13,height:13}}>{added ? I.check : I.plus}</span>
      </button>
    </div>
  );
};

// "Hero" image for the fashion modal — a stylized vertical figure built from items
const FashionHero = ({ look }) => (
  <div style={{
    width:380, maxWidth:'100%', aspectRatio:'3/4',
    background:'#FBF7EF',
    border:'1px solid #E3DCC9',
    borderRadius:4,
    position:'relative',
    overflow:'hidden',
    boxShadow:'0 12px 30px -20px rgba(60,40,20,.18)',
  }}>
    {/* Stylized figure constructed from look items */}
    <svg viewBox="0 0 200 280" width="100%" height="100%" style={{position:'absolute',inset:0}}>
      {/* Trench coat — large background */}
      <path d="M100 30 C88 30 80 36 76 46 L40 64 L26 130 L48 138 L46 268 L154 268 L152 138 L174 130 L160 64 L124 46 C120 36 112 30 100 30 Z" fill="#A88860"/>
      {/* Shirt collar */}
      <path d="M100 30 L84 56 L100 64 L116 56 Z" fill="#FFFFFF" stroke="#C9C2B5" strokeWidth="0.6"/>
      <path d="M96 56 L96 100 L104 100 L104 56" fill="#FFFFFF" stroke="#C9C2B5" strokeWidth="0.5"/>
      {/* Trouser */}
      <path d="M70 158 H130 L132 178 L124 268 L102 268 L100 200 L98 268 L76 268 L68 178 Z" fill="#1A1714"/>
      {/* Lapel detail */}
      <path d="M96 32 L80 138 M104 32 L120 138" stroke="#7B5E3F" strokeWidth="0.8" fill="none"/>
      {/* Buttons */}
      <circle cx="100" cy="100" r="1.4" fill="#5C3F1E"/>
      <circle cx="100" cy="118" r="1.4" fill="#5C3F1E"/>
      <circle cx="100" cy="136" r="1.4" fill="#5C3F1E"/>
      {/* Belt */}
      <rect x="46" y="140" width="108" height="5" fill="#5C3F1E"/>
      {/* Bag — slung on shoulder */}
      <g transform="translate(150 140)">
        <rect x="-8" y="0" width="28" height="36" rx="2" fill="#7B5429"/>
        <rect x="-8" y="0" width="28" height="6" fill="#5C3F1E"/>
        <path d="M-4 0 Q-4 -14 6 -14 Q16 -14 16 0" stroke="#3E2E18" strokeWidth="1.8" fill="none"/>
      </g>
      {/* Sneaker — at bottom */}
      <path d="M62 264 Q62 258 68 257 L80 254 Q82 246 92 246 L106 246 Q108 254 120 256 Q130 258 130 264 L130 268 L62 268 Z" fill="#FFFFFF" stroke="#1A1714" strokeWidth="0.8"/>
      <rect x="62" y="266" width="68" height="3" fill="#1A1714"/>
    </svg>
    {/* paper-grain detail */}
    <div style={{position:'absolute',inset:0,pointerEvents:'none',
      backgroundImage:'radial-gradient(circle at 30% 20%, rgba(255,255,255,.15) 0, transparent 60%)'
    }}/>
    {/* corner label */}
    <div style={{
      position:'absolute', bottom:12, left:14,
      fontSize:9, color:'#7A6E55', letterSpacing:'.18em', textTransform:'uppercase', fontWeight:500,
    }}>OBEN · LOOK 001 · NEUTRAL</div>
  </div>
);

// "Hero" image for the home modal — a stylized room view
const RoomHero = ({ look }) => (
  <div style={{
    width:560, maxWidth:'100%', aspectRatio:'4/3',
    background:'#F5EDDE',
    border:'1px solid #E3DCC9',
    borderRadius:4,
    position:'relative',
    overflow:'hidden',
    boxShadow:'0 12px 30px -20px rgba(60,40,20,.18)',
  }}>
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      {/* Wall vs floor split */}
      <rect x="0" y="0" width="400" height="190" fill="#F1E7D2"/>
      <rect x="0" y="190" width="400" height="110" fill="#D9C39C"/>
      <line x1="0" y1="190" x2="400" y2="190" stroke="#A88860" strokeWidth="0.6"/>
      {/* Art frame on wall */}
      <rect x="60" y="40" width="80" height="100" fill="#FBF7EF" stroke="#3E2E18" strokeWidth="2"/>
      <path d="M70 110 Q88 80 100 92 Q112 104 132 80" stroke="#7C2D12" strokeWidth="4" fill="none"/>
      <circle cx="90" cy="68" r="6" fill="#A88860"/>
      {/* Rug */}
      <ellipse cx="200" cy="260" rx="180" ry="22" fill="#5C2018"/>
      <ellipse cx="200" cy="260" rx="160" ry="16" fill="none" stroke="#E8DCC2" strokeWidth="1"/>
      {/* Sofa */}
      <path d="M220 160 Q220 148 232 148 H350 Q362 148 362 160 V230 H220 Z" fill="#C8B89B"/>
      <rect x="226" y="170" width="38" height="38" rx="4" fill="#D9CBB0"/>
      <rect x="265" y="170" width="38" height="38" rx="4" fill="#D9CBB0"/>
      <rect x="304" y="170" width="50" height="38" rx="4" fill="#D9CBB0"/>
      <line x1="226" y1="234" x2="226" y2="252" stroke="#3E2E18" strokeWidth="2.5"/>
      <line x1="358" y1="234" x2="358" y2="252" stroke="#3E2E18" strokeWidth="2.5"/>
      {/* Terracotta pillow */}
      <rect x="316" y="166" width="34" height="22" rx="5" fill="#7C2D12"/>
      {/* Chair */}
      <path d="M50 178 Q50 162 64 162 H110 Q124 162 124 178 V230 H50 Z" fill="#8C6B3E"/>
      <line x1="56" y1="230" x2="54" y2="254" stroke="#3E2E18" strokeWidth="2.5"/>
      <line x1="120" y1="230" x2="122" y2="254" stroke="#3E2E18" strokeWidth="2.5"/>
      {/* Floor lamp behind chair */}
      <path d="M16 90 L48 90 L42 130 L22 130 Z" fill="#FBF1D8" stroke="#B59E72" strokeWidth="0.7"/>
      <line x1="32" y1="130" x2="32" y2="252" stroke="#5A4A30" strokeWidth="2"/>
      <ellipse cx="32" cy="254" rx="16" ry="3" fill="#5A4A30"/>
      {/* Side table */}
      <ellipse cx="170" cy="190" rx="32" ry="6" fill="#A37748"/>
      <path d="M138 190 V196 Q170 202 202 196 V190" fill="#7B5429"/>
      <line x1="146" y1="198" x2="144" y2="244" stroke="#3E2E18" strokeWidth="2"/>
      <line x1="194" y1="198" x2="196" y2="244" stroke="#3E2E18" strokeWidth="2"/>
      {/* Vase on table */}
      <path d="M162 170 H178 L176 178 Q186 182 186 188 Q186 192 170 192 Q154 192 154 188 Q154 182 164 178 Z" fill="#C9A87C"/>
      {/* Book stack */}
      <rect x="210" y="186" width="32" height="4" fill="#5C2018"/>
      <rect x="212" y="182" width="28" height="4" fill="#3E140F"/>
      {/* Window slice on the right */}
      <rect x="370" y="36" width="22" height="110" fill="none" stroke="#A88860" strokeWidth="1"/>
      <line x1="381" y1="36" x2="381" y2="146" stroke="#A88860" strokeWidth="0.5"/>
      <line x1="370" y1="91" x2="392" y2="91" stroke="#A88860" strokeWidth="0.5"/>
    </svg>
    <div style={{
      position:'absolute', bottom:12, left:14,
      fontSize:9, color:'#7A6E55', letterSpacing:'.18em', textTransform:'uppercase', fontWeight:500,
    }}>OBEN · ROOM 001 · READING NOOK</div>
  </div>
);

// ============================================================
// 3) CART DRAWER
// ============================================================
const CartDrawer = ({ open, items, onClose, onRemove, onClear }) => {
  const total = items.reduce((s,i) => s + i.price, 0);

  return (
    <>
      {/* dim layer */}
      <div onClick={onClose} style={{
        position:'fixed',inset:0,zIndex:90,
        background:'rgba(20,18,16,.28)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition:'opacity .2s',
      }}/>
      {/* panel */}
      <aside style={{
        position:'fixed',top:0,right:0,bottom:0,width:420,maxWidth:'92vw',
        background:'var(--bg-soft)',
        borderLeft:'1px solid var(--line)',
        zIndex:91,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform .26s cubic-bezier(.4,0,.2,1)',
        display:'flex',flexDirection:'column',
      }}>
        {/* Header */}
        <div style={{padding:'18px 22px 16px',borderBottom:'1px solid var(--line-soft)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:3, fontWeight:500}}>Your cart</div>
            <div style={{fontSize:18,fontWeight:500,letterSpacing:'-.01em'}}>Cart · {items.length} item{items.length===1?'':'s'}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{width:32,height:32,display:'grid',placeItems:'center',color:'var(--muted)',borderRadius:4}}>
            <span style={{width:16,height:16}}>{I.close}</span>
          </button>
        </div>

        {/* Items */}
        <div style={{flex:1,overflowY:'auto', padding:'4px 0'}}>
          {items.length === 0 ? (
            <div style={{padding:'56px 22px', textAlign:'center',color:'var(--muted)'}}>
              <div style={{fontSize:14,marginBottom:4}}>Your cart is empty.</div>
              <div style={{fontSize:12.5}}>Add items from the chat or any look.</div>
            </div>
          ) : items.map(it => <CartLine key={it.id} item={it} onRemove={() => onRemove(it.id)} />)}
        </div>

        {/* Footer */}
        <div style={{borderTop:'1px solid var(--line-soft)', padding:'14px 22px 12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:10}}>
            <span style={{fontSize:11.5,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',fontWeight:500}}>Total</span>
            <span style={{fontSize:20,fontWeight:500,fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(0)}</span>
          </div>
          <div style={{fontSize:11.5,color:'var(--muted)',lineHeight:1.5, marginBottom:14}}>
            OBEN saves links — checkout happens on each retailer's site.
          </div>
          <button onClick={onClear} style={{fontSize:11.5,color:'var(--muted-2)',textDecoration:'underline',textUnderlineOffset:3, opacity: items.length ? 1 : .4}} disabled={!items.length}>
            Clear cart
          </button>
        </div>
      </aside>
    </>
  );
};

const CartLine = ({ item, onRemove }) => {
  const [hov, setHov] = useStateM(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:'grid',
        gridTemplateColumns:'56px 1fr auto',
        gap:14, alignItems:'flex-start',
        padding:'14px 22px',
        borderBottom:'1px solid var(--line-soft)',
        background: hov ? '#FCFBF8' : 'transparent',
      }}>
      <Product kind={item.asset} size={56} bg="#F4F1EA" />
      <div style={{minWidth:0}}>
        <div style={{fontSize:13.5,fontWeight:500,letterSpacing:'-.005em',lineHeight:1.3}}>{item.name}</div>
        <div style={{fontSize:11.5,color:'var(--muted)',marginTop:3}}>{item.retailer}</div>
        <a href="#" onClick={e=>e.preventDefault()} style={{
          marginTop:9, display:'inline-flex', alignItems:'center', gap:4,
          fontSize:11.5, color:'var(--ink)',
        }}>
          Go to store <span style={{width:11,height:11}}>{I.arrowRight}</span>
        </a>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:14}}>
        <span style={{fontSize:14,fontWeight:500,fontVariantNumeric:'tabular-nums'}}>€{item.price}</span>
        <button onClick={onRemove} title="Remove" style={{
          width:22,height:22,color:'var(--muted-2)',
          display:'grid',placeItems:'center',borderRadius:3,
          opacity: hov ? 1 : .5,
          transition:'opacity .12s',
        }}>
          <span style={{width:13,height:13}}>{I.close}</span>
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { LinksModal, VisualModal, CartDrawer });
