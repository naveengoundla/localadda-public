'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Banner } from '@/lib/api';

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = (n: number) => setI((p) => (n + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  // Text-only banners (no images anywhere) render as a compact, vertically
  // centered strip instead of a tall mostly-empty block.
  const hasImage = banners.some((b) => !!b.imageUrl);
  const minH = hasImage ? 150 : 92;

  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    touchX.current = null;
  }

  const wrap = (node: React.ReactNode, b: Banner) =>
    b.linkUrl ? <a href={b.linkUrl} style={{ textDecoration: 'none', color: 'inherit' }}>{node}</a> : node;

  return (
    <div
      className="mb-6 fade-up"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', minHeight: minH }}
    >
      {banners.map((b, idx) =>
        wrap(
          <div
            key={b.id}
            aria-hidden={idx !== i}
            style={{
              position: idx === 0 ? 'relative' : 'absolute',
              inset: 0,
              opacity: idx === i ? 1 : 0,
              transition: 'opacity .45s ease',
              pointerEvents: idx === i ? 'auto' : 'none',
              minHeight: minH,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: hasImage ? 'flex-end' : 'center',
            }}
          >
            {b.imageUrl ? (
              <Image
                src={b.imageUrl}
                alt={b.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority={idx === 0}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a1a2e,#0f3460)' }} />
            )}
            {/* readability overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.62))' }} />
            {/* text */}
            <div style={{ position: 'relative', padding: 18, color: '#fff' }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em' }}>{b.title}</h2>
              {b.subtitle && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{b.subtitle}</p>}
            </div>
          </div>,
          b,
        ),
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', right: 18, bottom: 14, display: 'flex', gap: 6, zIndex: 3 }}>
          {banners.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to banner ${idx + 1}`}
              onClick={() => setI(idx)}
              style={{
                width: idx === i ? 18 : 6, height: 6, borderRadius: 99, border: 'none', padding: 0, cursor: 'pointer',
                background: idx === i ? '#f5a623' : 'rgba(255,255,255,0.5)', transition: 'width .25s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
