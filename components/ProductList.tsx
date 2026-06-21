'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { StoreItem } from "@/types";
import { OrderBar, useCart, type OrderingInfo } from "@/components/OrderBar";

interface Props {
  items: StoreItem[];
  categoryEmoji: string;
  ordering?: OrderingInfo | null;
}

export function ProductList({ items, categoryEmoji, ordering }: Props) {
  const { cart, update, clear } = useCart(ordering?.storeSlug ?? '');
  // Preorder mode is opt-in: catalog stays clean until the user taps "Start Preorder".
  const [preorderMode, setPreorderMode] = useState(false);
  // Only items with an image participate in the gallery
  const galleryItems = items.filter((i) => i.imageUrl);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // If a saved cart already has items (returning visitor), open straight into preorder
  // mode — but only once, so the Cancel button isn't immediately overridden.
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

  // Keyboard navigation + lock body scroll while open
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

  // Touch swipe
  const [touchX, setTouchX] = useState<number | null>(null);

  const current = openIndex !== null ? galleryItems[openIndex] : null;

  return (
    <>
      {/* ── Preorder entry / status banner (pilot stores only) ── */}
      {ordering && (
        preorderMode ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            background: '#edfbf1', border: '1px solid rgba(29,185,84,0.2)',
            borderRadius: 12, padding: '10px 14px', marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#17a44b' }}>
              📋 Preorder mode — tap <span style={{ fontWeight: 900 }}>+ ADD</span> on items
            </div>
            <button
              onClick={() => setPreorderMode(false)}
              style={{ fontSize: 12.5, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPreorderMode(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg,#1db954,#17a44b)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '12px', marginBottom: 16,
              fontWeight: 800, fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(29,185,84,0.3)',
            }}
          >
            🛒 Start Preorder
          </button>
        )
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        {items.map((item) => {
          const galleryIdx = item.imageUrl ? galleryItems.findIndex((g) => g.id === item.id) : -1;
          return (
            <div key={item.id} className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: '1px solid #f5f5f5' }}>
              {item.imageUrl ? (
                <button
                  onClick={() => setOpenIndex(galleryIdx)}
                  className="relative w-11 h-11 flex-shrink-0 cursor-zoom-in"
                  style={{ border: 'none', padding: 0, background: 'none' }}
                  aria-label={`View ${item.name} image`}
                >
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-xl" sizes="44px" />
                </button>
              ) : (
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-xl" style={{ background: '#f4f2ee' }}>
                  {categoryEmoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: '#1a1a2e' }}>
                  {item.name}{item.isFeatured && <span className="ml-1 text-xs" style={{ color: '#f5a623' }}>★</span>}
                </div>
                {item.unit && <div className="text-xs" style={{ color: '#aaa' }}>per {item.unit}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div className="font-black text-base" style={{ color: '#e8401c' }}>₹{item.price}</div>
                {showSteppers && (
                  (cart[item.id] || 0) === 0 ? (
                    <button
                      onClick={() => update(item.id, 1)}
                      style={{
                        fontSize: 11.5, fontWeight: 800, padding: '4px 14px',
                        borderRadius: 8, border: '1.5px solid #1db954',
                        background: '#fff', color: '#17a44b', cursor: 'pointer',
                      }}
                    >
                      + ADD
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => update(item.id, -1)}
                        style={{ width: 24, height: 24, borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#fff', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}>−</button>
                      <span style={{ fontWeight: 800, fontSize: 13, minWidth: 14, textAlign: 'center' }}>{cart[item.id]}</span>
                      <button onClick={() => update(item.id, 1)}
                        style={{ width: 24, height: 24, borderRadius: 7, border: 'none', background: '#1db954', color: '#fff', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}>+</button>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Cart bar + checkout (pilot stores only) ── */}
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
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,10,20,0.94)',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeUp 0.18s ease both',
          }}
        >
          {/* Close */}
          <button
            onClick={close}
            aria-label="Close"
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 2,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', fontSize: 16, cursor: 'pointer',
            }}
          >
            ✕
          </button>

          {/* Arrows (desktop) */}
          {galleryItems.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous"
                className="hidden sm:flex"
                style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2,
                  width: 40, height: 40, borderRadius: '50%', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer',
                }}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next"
                className="hidden sm:flex"
                style={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2,
                  width: 40, height: 40, borderRadius: '50%', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer',
                }}>›</button>
            </>
          )}

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, position: 'relative', margin: '56px 16px 8px' }}
          >
            <Image
              src={current.imageUrl!}
              alt={current.name}
              fill
              className="object-contain"
              sizes="100vw"
              quality={85}
              priority
            />
          </div>

          {/* Caption */}
          <div style={{ textAlign: 'center', padding: '4px 16px' }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{current.name}</div>
            <div style={{ color: '#f5a623', fontWeight: 900, fontSize: 14, marginTop: 2 }}>
              ₹{current.price}{current.unit ? ` / ${current.unit}` : ''}
            </div>
          </div>

          {/* Thumbnail strip */}
          {galleryItems.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="scrollbar-hide"
              style={{
                display: 'flex', gap: 8, overflowX: 'auto',
                padding: '12px 16px max(20px, env(safe-area-inset-bottom))',
                justifyContent: galleryItems.length <= 6 ? 'center' : 'flex-start',
              }}
            >
              {galleryItems.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setOpenIndex(i)}
                  aria-label={g.name}
                  style={{
                    position: 'relative', width: 52, height: 52, flexShrink: 0,
                    borderRadius: 10, overflow: 'hidden', padding: 0, cursor: 'pointer',
                    border: 'none',
                    outline: i === openIndex ? '2.5px solid #f5a623' : '2.5px solid transparent',
                    opacity: i === openIndex ? 1 : 0.55,
                    transition: 'opacity 0.15s, outline-color 0.15s',
                  }}
                >
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
