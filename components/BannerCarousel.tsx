'use client';

import { useEffect, useState } from 'react';
import type { Banner } from '@/lib/api';

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;
  const b = banners[i];

  const card = (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 18,
        background: b.imageUrl
          ? `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.62)), url(${b.imageUrl}) center/cover`
          : 'linear-gradient(135deg,#1a1a2e,#0f3460)',
        color: '#fff',
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
        {b.title}
      </h2>
      {b.subtitle && (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{b.subtitle}</p>
      )}

      {banners.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {banners.map((_, idx) => (
            <span
              key={idx}
              style={{
                width: idx === i ? 18 : 6,
                height: 6,
                borderRadius: 99,
                background: idx === i ? '#f5a623' : 'rgba(255,255,255,0.5)',
                transition: 'width .25s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-6 fade-up">
      {b.linkUrl ? (
        <a href={b.linkUrl} style={{ textDecoration: 'none' }}>{card}</a>
      ) : (
        card
      )}
    </div>
  );
}
