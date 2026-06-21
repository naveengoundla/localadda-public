'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { StoreItem, CategoryField } from "@/types";
import { OrderBar, useCart, type OrderingInfo } from "@/components/OrderBar";

interface Props {
  items: StoreItem[];
  categoryEmoji: string;
  ordering?: OrderingInfo | null;
  schema?: CategoryField[];
  categorySlug?: string;
  layout?: 'list' | 'grid' | 'menu';
}

// Iconic veg / non-veg / egg indicator square used on restaurant menus.
function FoodMark({ type }: { type: string }) {
  const color = type === 'Veg' ? '#1a7a35' : type === 'Egg' ? '#d99100' : '#c01818';
  return (
    <span title={type} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 15, height: 15, border: `1.5px solid ${color}`, borderRadius: 3, flexShrink: 0,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
    </span>
  );
}

function attrChips(item: StoreItem, schema?: CategoryField[], categorySlug?: string) {
  const attrs = item.attributes;
  if (!schema || !attrs) return null;
  const chips: { text: string; tone: 'bool' | 'plain' }[] = [];
  for (const f of schema) {
    if (categorySlug === 'restaurant' && (f.key === 'foodType' || f.key === 'course')) continue;
    const v = attrs[f.key];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    if (f.type === 'bool') {
      if (v === true) chips.push({ text: f.label, tone: 'bool' });
    } else if (Array.isArray(v)) {
      for (const x of v) chips.push({ text: String(x), tone: 'plain' });
    } else {
      chips.push({ text: String(v), tone: 'plain' });
    }
  }
  if (chips.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {chips.map((c, i) => (
        <span key={i} style={{
          fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 6, lineHeight: 1.5,
          background: c.tone === 'bool' ? '#edfbf1' : '#f1efe9',
          color: c.tone === 'bool' ? '#17a44b' : '#7a766c',
          border: c.tone === 'bool' ? '1px solid rgba(29,185,84,0.18)' : '1px solid rgba(0,0,0,0.04)',
        }}>
          {c.text}
        </span>
      ))}
    </div>
  );
}

export function ProductList({ items, categoryEmoji, ordering, schema, categorySlug, layout = 'list' }: Props) {
  const isGrid = layout === 'grid';
  const isMenu = layout === 'menu';
  const { cart, update, clear } = useCart(ordering?.storeSlug ?? '');
  const [preorderMode, setPreorderMode] = useState(false);

  const isRestaurant = categorySlug === 'restaurant';
  const hasVeg = isRestaurant && items.some((i) => i.attributes?.foodType === 'Veg');
  const [vegOnly, setVegOnly] = useState(false);

  // ── Search + lazy load ──
  const INITIAL = isGrid ? 8 : 16;
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(INITIAL);
  useEffect(() => { setShown(INITIAL); }, [query, vegOnly, INITIAL]);

  let filtered = items;
  if (vegOnly) filtered = filtered.filter((i) => i.attributes?.foodType === 'Veg');
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter((i) => i.name.toLowerCase().includes(q));
  }
  // Menu shows all (grouped); list/grid lazy-load.
  const visible = isMenu ? filtered : filtered.slice(0, shown);
  const showSearch = items.length >= 8;

  // Menu grouping by the "course" attribute, ordered by the schema's option list.
  const courseField = schema?.find((f) => f.key === 'course');
  const courseOrder = courseField?.options ?? [];
  const menuGroups: { name: string; items: StoreItem[] }[] = (() => {
    if (!isMenu) return [];
    const map = new Map<string, StoreItem[]>();
    for (const it of filtered) {
      const c = (it.attributes?.course as string) || 'More';
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(it);
    }
    const rank = (n: string) => {
      const i = courseOrder.indexOf(n);
      return i === -1 ? 999 : i;
    };
    return Array.from(map.entries())
      .map(([name, its]) => ({ name, items: its }))
      .sort((a, b) => rank(a.name) - rank(b.name));
  })();

  // ── Lightbox (over all images, not just visible) ──
  const galleryItems = items.filter((i) => i.imageUrl);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openLightbox = (item: StoreItem) => {
    const idx = galleryItems.findIndex((g) => g.id === item.id);
    if (idx >= 0) setOpenIndex(idx);
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const didAutoOpen = useRef(false);
  useEffect(() => {
    if (ordering && cartCount > 0 && !didAutoOpen.current) {
      didAutoOpen.current = true;
      setPreorderMode(true);
    }
  }, [ordering, cartCount]);

  const showSteppers = !!ordering && preorderMode;

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => (i === null ? null : (i + galleryItems.length - 1) % galleryItems.length)), [galleryItems.length]);
  const next = useCallback(() => setOpenIndex((i) => (i === null ? null : (i + 1) % galleryItems.length)), [galleryItems.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, prev, next]);

  const [touchX, setTouchX] = useState<number | null>(null);
  const current = openIndex !== null ? galleryItems[openIndex] : null;

  // ── Shared +ADD / quantity stepper ──
  const Stepper = ({ id }: { id: string }) => (
    (cart[id] || 0) === 0 ? (
      <button onClick={() => update(id, 1)}
        style={{ fontSize: 11.5, fontWeight: 800, padding: '4px 14px', borderRadius: 8, border: '1.5px solid #1db954', background: '#fff', color: '#17a44b', cursor: 'pointer' }}>
        + ADD
      </button>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => update(id, -1)} style={{ width: 24, height: 24, borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#fff', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}>−</button>
        <span style={{ fontWeight: 800, fontSize: 13, minWidth: 14, textAlign: 'center' }}>{cart[id]}</span>
        <button onClick={() => update(id, 1)} style={{ width: 24, height: 24, borderRadius: 7, border: 'none', background: '#1db954', color: '#fff', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}>+</button>
      </div>
    )
  );

  // Shared list/menu row
  const listRow = (item: StoreItem) => {
    const foodType = isRestaurant ? (item.attributes?.foodType as string | undefined) : undefined;
    return (
      <div key={item.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #f5f5f5' }}>
        {item.imageUrl ? (
          <button onClick={() => openLightbox(item)} className="relative w-11 h-11 flex-shrink-0 cursor-zoom-in" style={{ border: 'none', padding: 0, background: 'none' }} aria-label={`View ${item.name} image`}>
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-xl" sizes="44px" />
          </button>
        ) : (
          <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-xl" style={{ background: '#f4f2ee' }}>{categoryEmoji}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm flex items-center gap-1.5" style={{ color: '#1a1a2e' }}>
            {foodType && <FoodMark type={foodType} />}
            <span className="truncate">{item.name}</span>
            {item.isFeatured && <span className="text-xs" style={{ color: '#f5a623' }}>★</span>}
          </div>
          {item.unit && <div className="text-xs" style={{ color: '#aaa' }}>per {item.unit}</div>}
          {attrChips(item, schema, categorySlug)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div className="font-black text-base" style={{ color: '#e8401c' }}>₹{item.price}</div>
          {showSteppers && <Stepper id={item.id} />}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Preorder entry / status banner ── */}
      {ordering && (
        preorderMode ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#edfbf1', border: '1px solid rgba(29,185,84,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#17a44b' }}>📋 Preorder mode — tap <span style={{ fontWeight: 900 }}>+ ADD</span> on items</div>
            <button onClick={() => setPreorderMode(false)} style={{ fontSize: 12.5, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setPreorderMode(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#1db954,#17a44b)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', marginBottom: 16, fontWeight: 800, fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(29,185,84,0.3)' }}>🛒 Start Preorder</button>
        )
      )}

      {/* ── In-store search ── */}
      {showSearch && (
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#bbb' }}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${items.length} items…`}
            style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: 10, border: '1.5px solid #e6e1d8', background: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#1a1a2e' }}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#aaa', cursor: 'pointer', fontSize: 14 }}>✕</button>
          )}
        </div>
      )}

      {/* ── Restaurant veg filter ── */}
      {hasVeg && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setVegOnly((v) => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '6px 12px', borderRadius: 20, fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', border: vegOnly ? '1.5px solid #1a7a35' : '1.5px solid #e0e0e0', background: vegOnly ? '#eaf7ee' : '#fff', color: vegOnly ? '#1a7a35' : '#888' }}>
            <FoodMark type="Veg" /> Veg only{vegOnly ? ' ✓' : ''}
          </button>
        </div>
      )}

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <p style={{ fontSize: 13.5, color: '#aaa', padding: '12px 0' }}>No items match “{query}”.</p>
      )}

      {/* ── GRID layout ── */}
      {isGrid && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((item) => (
            <div key={item.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => item.imageUrl && openLightbox(item)}
                style={{ position: 'relative', width: '100%', height: 150, border: 'none', padding: 0, background: '#f4f2ee', cursor: item.imageUrl ? 'zoom-in' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label={item.imageUrl ? `View ${item.name}` : item.name}
              >
                {item.imageUrl
                  ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="(max-width:640px) 50vw, 25vw" />
                  : <span style={{ fontSize: 40 }}>{categoryEmoji}</span>}
                {item.isFeatured && (
                  <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 10, fontWeight: 800, color: '#fff', background: 'rgba(245,166,35,0.95)', padding: '2px 6px', borderRadius: 6 }}>★ Featured</span>
                )}
              </button>
              <div style={{ padding: '9px 10px 10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 12.5, color: '#1a1a2e', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                {attrChips(item, schema, categorySlug)}
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 6 }}>
                  <span style={{ fontWeight: 900, fontSize: 14, color: '#e8401c' }}>₹{item.price}</span>
                  {showSteppers && <Stepper id={item.id} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LIST layout ── */}
      {layout === 'list' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {visible.map((item) => listRow(item))}
        </div>
      )}

      {/* ── MENU layout (grouped by section) ── */}
      {isMenu && menuGroups.length > 0 && (
        <div>
          {menuGroups.map((g) => (
            <section key={g.name} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '4px 0 6px', paddingBottom: 6, borderBottom: '2px solid #f0ede7' }}>
                <h3 style={{ fontSize: 14, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.01em' }}>{g.name}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#bbb' }}>{g.items.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {g.items.map((item) => listRow(item))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ── Show more (list/grid only) ── */}
      {!isMenu && filtered.length > shown && (
        <button
          onClick={() => setShown((s) => s + INITIAL)}
          style={{ width: '100%', marginTop: 14, padding: '11px', borderRadius: 10, border: '1px solid #e6e1d8', background: '#fff', color: '#17a44b', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Show {Math.min(INITIAL, filtered.length - shown)} more · {filtered.length - shown} left ↓
        </button>
      )}

      {/* ── Cart bar + checkout ── */}
      {ordering && (
        <OrderBar items={items} ordering={ordering} cart={cart} updateCart={update} clearCart={clear} />
      )}

      {/* ── Lightbox ── */}
      {current && openIndex !== null && (
        <div
          onClick={close}
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (dx > 50) prev();
            else if (dx < -50) next();
            setTouchX(null);
          }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,10,20,0.94)', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.18s ease both' }}
        >
          <button onClick={close} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer' }}>✕</button>
          {galleryItems.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous" className="hidden sm:flex" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 40, height: 40, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer' }}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" className="hidden sm:flex" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 40, height: 40, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer' }}>›</button>
            </>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ flex: 1, position: 'relative', margin: '56px 16px 8px' }}>
            <Image src={current.imageUrl!} alt={current.name} fill className="object-contain" sizes="100vw" quality={85} priority />
          </div>
          <div style={{ textAlign: 'center', padding: '4px 16px' }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{current.name}</div>
            <div style={{ color: '#f5a623', fontWeight: 900, fontSize: 14, marginTop: 2 }}>₹{current.price}{current.unit ? ` / ${current.unit}` : ''}</div>
          </div>
          {galleryItems.length > 1 && (
            <div onClick={(e) => e.stopPropagation()} className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px max(20px, env(safe-area-inset-bottom))', justifyContent: galleryItems.length <= 6 ? 'center' : 'flex-start' }}>
              {galleryItems.map((g, i) => (
                <button key={g.id} onClick={() => setOpenIndex(i)} aria-label={g.name} style={{ position: 'relative', width: 52, height: 52, flexShrink: 0, borderRadius: 10, overflow: 'hidden', padding: 0, cursor: 'pointer', border: 'none', outline: i === openIndex ? '2.5px solid #f5a623' : '2.5px solid transparent', opacity: i === openIndex ? 1 : 0.55, transition: 'opacity 0.15s, outline-color 0.15s' }}>
                  <Image src={g.imageUrl!} alt={g.name} fill className="object-cover" sizes="52px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
