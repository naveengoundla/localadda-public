'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Store, City } from '@/types';
import { type Banner, groupByCategory } from '@/lib/api';
import { StoreCard } from './StoreCard';
import { BannerCarousel } from './BannerCarousel';
import { NearMe } from './NearMe';
import { RememberCity } from './RememberCity';

const CAT_GRADIENT: Record<string, string> = {
  grocery: 'linear-gradient(135deg,#11998e,#38ef7d)',
  clothing: 'linear-gradient(135deg,#f093fb,#f5576c)',
  mobile: 'linear-gradient(135deg,#4facfe,#00f2fe)',
  hardware: 'linear-gradient(135deg,#f7971e,#ffd200)',
  medical: 'linear-gradient(135deg,#ee9ca7,#ffdde1)',
  books: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  restaurant: 'linear-gradient(135deg,#f7971e,#f5576c)',
  vegetables: 'linear-gradient(135deg,#56ab2f,#a8e063)',
  electrical: 'linear-gradient(135deg,#4776E6,#8E54E9)',
};

export function CityBrowse({ city, banners, stores }: { city: City; banners: Banner[]; stores: Store[] }) {
  const citySlug = city.slug;
  const [tab, setTab] = useState<string>('');   // '' = Home
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();
  const searching = query.length > 0;

  const allGrouped = groupByCategory(stores);
  const categories = Object.keys(allGrouped).map((slug) => ({
    slug,
    name: allGrouped[slug][0].category.name,
    emoji: allGrouped[slug][0].category.emoji,
    count: allGrouped[slug].length,
  }));
  const deals = stores.filter((s) => s.discounts?.some((d) => d.isActive)).slice(0, 6);

  const results = searching ? stores.filter((s) => s.name.toLowerCase().includes(query)) : [];
  const isHome = tab === '' && !searching;
  const catStores = tab ? (allGrouped[tab] ?? []) : [];
  const catMeta = catStores[0]?.category;

  function pickTab(slug: string) { setQ(''); setTab(slug); }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef' }}>
      <RememberCity slug={citySlug} />

      {/* ── Header ── */}
      <header style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black" style={{ color: '#f5a623', letterSpacing: '-0.02em' }}>
            Local<span style={{ color: '#fff' }}>Adda</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 99, padding: '6px 14px' }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span className="font-bold text-sm text-white">{city.name}</span>
            <Link href="/?pick=1" className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.45)' }}>change</Link>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="relative" style={{ maxWidth: 540 }}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search stores in ${city.name}…`}
              className="search-input w-full text-sm font-medium"
              style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 11, paddingBottom: 11 }}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => pickTab('')} className="nav-pill flex-shrink-0" data-active={isHome ? 'true' : 'false'}>
            🏠 Home
          </button>
          {categories.map((cat) => (
            <button key={cat.slug} onClick={() => pickTab(cat.slug)} className="nav-pill flex-shrink-0" data-active={tab === cat.slug && !searching ? 'true' : 'false'}>
              {cat.emoji} {cat.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        {/* Search results */}
        {searching && (
          <>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#9898a8', marginBottom: 20 }}>
              {results.length === 0 ? 'No stores found' : `${results.length} result${results.length > 1 ? 's' : ''}`}
              {' '}for &ldquo;<strong style={{ color: '#1a1a2e' }}>{q.trim()}</strong>&rdquo;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((store) => <StoreCard key={store.id} store={store} citySlug={citySlug} />)}
            </div>
          </>
        )}

        {/* Home tab */}
        {isHome && (
          <>
            <BannerCarousel banners={banners} />
            <NearMe stores={stores} citySlug={citySlug} />
            {deals.length > 0 && (
              <section className="mb-8 fade-up" style={{ animationDelay: '0.05s' }}>
                <div className="section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg,#e8401c,#f5a623)' }}>🔥</div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: '#1a1a2e', letterSpacing: '-0.01em' }}>Today's Deals</div>
                      <div className="section-label">Stores with active offers</div>
                    </div>
                  </div>
                  <span className="sponsored-chip">Sponsored ✦</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {deals.map((store) => <StoreCard key={store.id} store={store} citySlug={citySlug} />)}
                </div>
              </section>
            )}
          </>
        )}

        {/* Category tab */}
        {!isHome && !searching && catMeta && (
          <section className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="section-icon" style={{ background: CAT_GRADIENT[tab] || 'linear-gradient(135deg,#667eea,#764ba2)' }}>{catMeta.emoji}</div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.02em' }}>{catMeta.name} in {city.name}</h1>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#ffe8e5', color: '#e8401c' }}>{catStores.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catStores.map((store) => <StoreCard key={store.id} store={store} citySlug={citySlug} />)}
            </div>
          </section>
        )}

        <div style={{ textAlign: 'center', paddingTop: 24, marginTop: 8, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: 13, color: '#b0b0be' }}>
            {stores.length} stores in {city.name} ·{' '}
            <Link href="https://dashboard.localadda.com" style={{ fontWeight: 600, color: '#e8401c' }}>List yours →</Link>
          </p>
          <p style={{ marginTop: 8, fontSize: 12, color: '#b0b0be', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/terms" style={{ color: '#999' }}>Terms</Link>
            <Link href="/privacy" style={{ color: '#999' }}>Privacy</Link>
            <Link href="/seller-terms" style={{ color: '#999' }}>Seller Terms</Link>
            <Link href="/grievance" style={{ color: '#999' }}>Grievance</Link>
          </p>
          <p style={{ marginTop: 6, fontSize: 11, color: '#c4c4cc', maxWidth: 520, margin: '6px auto 0', lineHeight: 1.5 }}>
            Prices &amp; details are provided by stores — please confirm before buying. LocalAdda is a listing platform, not the seller.
          </p>
        </div>
      </div>
    </div>
  );
}
