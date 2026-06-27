'use client';

import { useState } from 'react';
import type { Store } from '@/types';
import { StoreCard } from './StoreCard';

/**
 * Client-side store search. Keeps the page static/edge-cacheable (no server
 * searchParams). When `showAllWhenEmpty` is true it renders the full grid and
 * filters it as you type (category page); otherwise it shows results only while
 * searching (city home, where deals render separately below).
 */
export function CitySearch({ stores, citySlug, placeholder, showAllWhenEmpty = false }: {
  stores: Store[]; citySlug: string; placeholder: string; showAllWhenEmpty?: boolean;
}) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const results = query
    ? stores.filter((s) => s.name.toLowerCase().includes(query))
    : (showAllWhenEmpty ? stores : []);
  const showGrid = !!query || showAllWhenEmpty;

  return (
    <>
      <div style={{ position: 'relative', maxWidth: 540, marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#aaa' }}>🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '11px 16px 11px 40px', borderRadius: 12,
            border: '1px solid #e3e3e3', fontSize: 14, background: '#fff', color: '#1a1a2e',
          }}
        />
      </div>

      {query && (
        <p style={{ fontSize: 13, color: '#9898a8', marginBottom: 16 }}>
          {results.length === 0 ? 'No stores found' : `${results.length} result${results.length > 1 ? 's' : ''}`}
          {' '}for &ldquo;<strong style={{ color: '#1a1a2e' }}>{q.trim()}</strong>&rdquo;
        </p>
      )}

      {showGrid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((s) => <StoreCard key={s.id} store={s} citySlug={citySlug} />)}
        </div>
      )}
    </>
  );
}
