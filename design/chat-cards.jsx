// ============================================================
// OBEN — AI response cards rendered inline within chat messages.
// PRICE, FASHION, HOME variants.
// ============================================================

const { useState } = React;

// ---------- shared ----------
const cardOuter = {
  border:'1px solid var(--line)',
  background:'var(--bg-soft)',
  borderRadius:6,
  marginTop:14,
  overflow:'hidden',
};

const cardHead = {
  padding:'14px 16px 12px',
  borderBottom:'1px solid var(--line-soft)',
  display:'flex',alignItems:'center',justifyContent:'space-between',
  fontSize:12, color:'var(--muted)',letterSpacing:'.04em', textTransform:'uppercase', fontWeight:500,
};
const cardLink = {
  fontSize:13, color:'var(--ink)', fontWeight:500, display:'inline-flex', gap:6, alignItems:'center',
  cursor:'pointer',
};
const cardLink_hov = (e, hov) => { e.currentTarget.style.opacity = hov ? '.6' : '1' };

// ============================================================
// PRICE COMPARE CARD
// ============================================================
const PriceCard = ({ product, retailers, onAdd, onOpenModal }) => {
  return (
    <div style={cardOuter}>
      <div style={cardHead}>
        <span>Price compare · {retailers.length} retailers</span>
        <span style={{textTransform:'none',letterSpacing:0,fontWeight:400}}>Sorted by price</span>
      </div>
      {/* Product header */}
      <div style={{display:'flex',gap:14,padding:'14px 16px',alignItems:'center',borderBottom:'1px solid var(--line-soft)'}}>
        <Product kind={product.asset} size={56} bg="#F4F1EA" />
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14, fontWeight:500, marginBottom:3, letterSpacing:'-.01em'}}>{product.name}</div>
          <div style={{fontSize:12.5, color:'var(--muted)'}}>{product.variant}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2}}>Lowest</div>
          <div style={{fontSize:18, fontWeight:500, fontVariantNumeric:'tabular-nums'}}>€{retailers[0].price.toFixed(0)}</div>
        </div>
      </div>

      {/* Table */}
      <div role="table" style={{padding:'4px 6px 8px'}}>
        {/* header */}
        <div role="row" style={{
          display:'grid',
          gridTemplateColumns:'1.3fr .9fr 1.2fr auto auto',
          padding:'8px 10px 6px',
          fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:500,
        }}>
          <span>Retailer</span>
          <span style={{textAlign:'right'}}>Price</span>
          <span style={{paddingLeft:18}}>Delivery</span>
          <span style={{paddingLeft:14}}>Visit</span>
          <span style={{width:28}} />
        </div>
        {retailers.slice(0,4).map((r,i) => (
          <PriceRow key={r.id} r={r} highlight={i===0} onAdd={() => onAdd(r)} />
        ))}
      </div>

      <div style={{padding:'10px 16px 14px', borderTop:'1px solid var(--line-soft)', display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12.5,color:'var(--muted)'}}>+ {retailers.length - 4} more retailers</span>
        <span style={cardLink} onClick={onOpenModal} onMouseEnter={e=>cardLink_hov(e,1)} onMouseLeave={e=>cardLink_hov(e,0)}>
          See all {I.arrowRight}
        </span>
      </div>
    </div>
  );
};

const PriceRow = ({ r, highlight, onAdd }) => {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);
  return (
    <div role="row"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:'grid',
        gridTemplateColumns:'1.3fr .9fr 1.2fr auto auto',
        padding:'10px 10px',
        alignItems:'center',
        fontSize:13.5,
        borderRadius:4,
        background: hov ? '#F6F5F1' : 'transparent',
      }}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{
          width:22,height:22,borderRadius:'50%',background:'#F4F1EA',color:'#5C3F1E',
          display:'grid',placeItems:'center',fontSize:10,fontWeight:500,letterSpacing:'.04em'
        }}>{r.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</span>
        <span style={{fontWeight: highlight ? 500 : 400}}>{r.name}</span>
      </div>
      <span style={{textAlign:'right', fontWeight:500, fontVariantNumeric:'tabular-nums',
        color: highlight ? 'var(--accent)' : 'var(--ink)'}}>€{r.price.toFixed(0)}</span>
      <span style={{color:'var(--muted)', paddingLeft:18}}>{r.ship}</span>
      <a style={{paddingLeft:14, color:'var(--ink)', fontSize:13, display:'inline-flex',alignItems:'center',gap:4}}
         onClick={e=>e.preventDefault()} href="#">
        Visit <span style={{width:13,height:13,display:'inline-flex'}}>{I.arrowRight}</span>
      </a>
      <button
        onClick={() => { setAdded(true); onAdd(); setTimeout(()=>setAdded(false), 1200); }}
        title="Add to cart"
        style={{
          width:26,height:26,borderRadius:4,
          display:'grid',placeItems:'center',
          color: added ? 'var(--accent)' : 'var(--muted)',
          background: hov ? '#FFFFFF' : 'transparent',
          border:'1px solid '+ (hov ? 'var(--line)' : 'transparent'),
          transition:'all .14s',
        }}>
        <span style={{width:14,height:14,display:'inline-flex'}}>
          {added ? I.check : I.plus}
        </span>
      </button>
    </div>
  );
};

// ============================================================
// FASHION CARD
// ============================================================
const FashionCard = ({ look, onAdd, onOpenModal }) => (
  <div style={cardOuter}>
    <div style={cardHead}>
      <span>Fashion · curated look</span>
      <span style={{textTransform:'none',letterSpacing:0,fontWeight:400}}>6 pieces · €1,087 total</span>
    </div>
    <p style={{
      margin:0,padding:'14px 16px 6px',fontSize:14.5,lineHeight:1.55,color:'var(--ink)',
      letterSpacing:'-.005em', textWrap:'pretty',
    }}>{look.desc}</p>

    <ChipStrip items={look.items} onAdd={onAdd} />

    <div style={{padding:'8px 16px 14px', borderTop:'1px solid var(--line-soft)'}}>
      <span style={cardLink} onClick={onOpenModal} onMouseEnter={e=>cardLink_hov(e,1)} onMouseLeave={e=>cardLink_hov(e,0)}>
        View full look {I.arrowRight}
      </span>
    </div>
  </div>
);

// ============================================================
// HOME CARD
// ============================================================
const HomeCard = ({ look, onAdd, onOpenModal }) => (
  <div style={cardOuter}>
    <div style={cardHead}>
      <span>Home & Living · room concept</span>
      <span style={{textTransform:'none',letterSpacing:0,fontWeight:400}}>{look.items.length} pieces</span>
    </div>
    <p style={{
      margin:0,padding:'14px 16px 6px',fontSize:14.5,lineHeight:1.55,color:'var(--ink)',
      letterSpacing:'-.005em', textWrap:'pretty',
    }}>{look.desc}</p>

    <ChipStrip items={look.items} onAdd={onAdd} />

    <div style={{padding:'8px 16px 14px', borderTop:'1px solid var(--line-soft)'}}>
      <span style={cardLink} onClick={onOpenModal} onMouseEnter={e=>cardLink_hov(e,1)} onMouseLeave={e=>cardLink_hov(e,0)}>
        View room concept {I.arrowRight}
      </span>
    </div>
  </div>
);

// ============================================================
// CHIP STRIP — horizontal scroll of product chips
// ============================================================
const ChipStrip = ({ items, onAdd }) => (
  <div style={{
    display:'flex',gap:10,
    padding:'10px 16px 14px',
    overflowX:'auto',
    scrollSnapType:'x proximity',
  }}>
    {items.map(it => (
      <Chip key={it.id} item={it} onAdd={() => onAdd(it)} />
    ))}
  </div>
);

const Chip = ({ item, onAdd }) => {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        flex:'0 0 auto',width:148,
        scrollSnapAlign:'start',
        border:'1px solid var(--line)',
        background: hov ? '#FFFFFF' : 'var(--bg)',
        borderRadius:6,
        padding:10,
        position:'relative',
        transition:'background .14s, border-color .14s',
        borderColor: hov ? '#D5D2C9' : 'var(--line)',
      }}>
      <Product kind={item.asset} size={128} bg="#F4F1EA" />
      <div style={{marginTop:10,fontSize:12.5,lineHeight:1.35, fontWeight:500,letterSpacing:'-.005em'}}>{item.name}</div>
      <div style={{marginTop:4,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:11.5,color:'var(--muted)'}}>{item.retailer}</span>
        <span style={{fontSize:12.5,fontWeight:500,fontVariantNumeric:'tabular-nums'}}>€{item.price}</span>
      </div>
      <button
        title="Add to cart"
        onClick={() => { setAdded(true); onAdd(); setTimeout(()=>setAdded(false), 1200); }}
        style={{
          position:'absolute',top:8,right:8,
          width:24,height:24,borderRadius:'50%',
          background:'#FFFFFF',border:'1px solid var(--line)',
          color: added ? 'var(--accent)' : 'var(--ink)',
          display:'grid',placeItems:'center',
          opacity: hov || added ? 1 : 0,
          transition:'opacity .15s',
        }}>
        <span style={{width:12,height:12,display:'inline-flex'}}>{added ? I.check : I.plus}</span>
      </button>
    </div>
  );
};

Object.assign(window, { PriceCard, FashionCard, HomeCard });
