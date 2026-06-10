import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getStoresByCity, groupByCategory } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";
import type { Store } from "@/types";

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}

const CAT_GRADIENT: Record<string, string> = {
  grocery:    'linear-gradient(135deg,#11998e,#38ef7d)',
  clothing:   'linear-gradient(135deg,#f093fb,#f5576c)',
  mobile:     'linear-gradient(135deg,#4facfe,#00f2fe)',
  hardware:   'linear-gradient(135deg,#f7971e,#ffd200)',
  medical:    'linear-gradient(135deg,#ee9ca7,#ffdde1)',
  books:      'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  restaurant: 'linear-gradient(135deg,#f7971e,#f5576c)',
  vegetables: 'linear-gradient(135deg,#56ab2f,#a8e063)',
  electrical: 'linear-gradient(135deg,#4776E6,#8E54E9)',
};

const CITY_INFO: Record<string, {
  tagline: string;
  highlights: { emoji: string; label: string }[];
  funFact: string;
}> = {
  vikarabad: {
    tagline: 'Gateway to the Nallamala Forest',
    highlights: [
      { emoji: '⛰️', label: 'Ananthagiri Hills' },
      { emoji: '🌊', label: 'Kotepally Reservoir' },
      { emoji: '🌿', label: 'Dachepalli Forest' },
      { emoji: '🛕', label: 'Chilkur Balaji' },
    ],
    funFact: '60 km from Hyderabad · Known for waterfalls & trekking',
  },
  mumbai: {
    tagline: 'The City That Never Sleeps',
    highlights: [
      { emoji: '🌉', label: 'Gateway of India' },
      { emoji: '🎬', label: 'Bollywood Hub' },
      { emoji: '🏖️', label: 'Juhu Beach' },
      { emoji: '🏙️', label: 'Bandra-Worli Sea Link' },
    ],
    funFact: 'India\'s financial capital · Home to Bollywood',
  },
  hyderabad: {
    tagline: 'City of Pearls & Biryani',
    highlights: [
      { emoji: '🏰', label: 'Charminar' },
      { emoji: '🍚', label: 'Hyderabadi Biryani' },
      { emoji: '💎', label: 'Pearl Market' },
      { emoji: '🦁', label: 'Nehru Zoological Park' },
    ],
    funFact: 'Former seat of the Nizams · Now India\'s IT hub',
  },
  pune: {
    tagline: 'Oxford of the East',
    highlights: [
      { emoji: '🏰', label: 'Shaniwar Wada' },
      { emoji: '🎓', label: 'University Hub' },
      { emoji: '🌄', label: 'Sinhagad Fort' },
      { emoji: '🛕', label: 'Dagdusheth Ganpati' },
    ],
    funFact: 'Education & IT hub · Home to Maratha history',
  },
  delhi: {
    tagline: 'Heart of Incredible India',
    highlights: [
      { emoji: '🕌', label: 'Red Fort' },
      { emoji: '🏛️', label: 'India Gate' },
      { emoji: '🛕', label: 'Qutub Minar' },
      { emoji: '🛍️', label: 'Connaught Place' },
    ],
    funFact: 'Capital of India · 3000+ years of history',
  },
};

const DEFAULT_CITY_INFO = {
  tagline: 'Discover local businesses near you',
  highlights: [
    { emoji: '🏪', label: 'Local Stores' },
    { emoji: '🍽️', label: 'Restaurants' },
    { emoji: '🛒', label: 'Grocery' },
    { emoji: '💊', label: 'Pharmacy' },
  ],
  funFact: 'Supporting local businesses in your city',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) return {};
  return {
    title: `Local Stores in ${city.name} — LocalAdda`,
    description: `Discover local stores in ${city.name}, ${city.state}.`,
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city: citySlug } = await params;
  const { category: filterCategory, q: searchQuery } = await searchParams;

  const [cities, allStores] = await Promise.all([getCities(), getStoresByCity(citySlug)]);

  const cityFromList = cities.find((c) => c.slug === citySlug);
  const cityFromStores = allStores[0]?.city;
  const city = cityFromList ?? cityFromStores
    ?? { slug: citySlug, name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1), state: '', id: '' };
  if (!cityFromList && !cityFromStores && allStores.length === 0) notFound();

  const cityInfo = CITY_INFO[citySlug] ?? DEFAULT_CITY_INFO;

  let stores = allStores;
  if (searchQuery) stores = stores.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const grouped = groupByCategory(stores);
  const allGrouped = groupByCategory(allStores);

  const promotedStores: Store[] = allStores
    .filter((s) => s.discounts?.some((d) => d.isActive))
    .slice(0, 6);

  const uniqueCategories = Object.keys(allGrouped).map((slug) => ({
    slug,
    name: allGrouped[slug][0].category.name,
    emoji: allGrouped[slug][0].category.emoji,
    count: allGrouped[slug].length,
  }));

  const displayCategories = filterCategory
    ? Object.keys(grouped).filter((c) => c === filterCategory)
    : Object.keys(grouped);

  const isDefaultView = !filterCategory && !searchQuery;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black" style={{ color: '#f5a623', letterSpacing: '-0.02em' }}>
            Local<span style={{ color: '#fff' }}>Adda</span>
          </Link>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: 99,
            padding: '6px 14px',
          }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span className="font-bold text-sm text-white">{city.name}</span>
            <Link href="/" className="text-xs ml-1 hidden sm:block" style={{ color: 'rgba(255,255,255,0.45)' }}>change</Link>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <form method="GET">
            <div className="relative" style={{ maxWidth: 540 }}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>🔍</span>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search stores in ${city.name}…`}
                className="search-input w-full text-sm font-medium"
                style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 11, paddingBottom: 11 }}
              />
            </div>
          </form>
        </div>

        {/* Category pill tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {/* Home pill — always first */}
          <Link
            href={`/${citySlug}`}
            className="nav-pill flex-shrink-0"
            data-active={isDefaultView ? 'true' : 'false'}
          >
            🏠 Home
          </Link>

          {uniqueCategories.map((cat) => {
            const active = filterCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={active ? `/${citySlug}` : `/${citySlug}?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className="nav-pill flex-shrink-0"
                data-active={active ? 'true' : 'false'}
              >
                {cat.emoji} {cat.name.split(' ')[0]}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        {/* ── Default view ── */}
        {isDefaultView && (
          <>
            {/* City highlight card */}
            <div className="city-highlight-card mb-6 fade-up">
              <div style={{ padding: '20px 20px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#f5a623',
                      marginBottom: 6,
                    }}>
                      📍 {city.name}{city.state ? `, ${city.state}` : ''}
                    </p>
                    <h2 style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: '#fff',
                      lineHeight: 1.25,
                      letterSpacing: '-0.02em',
                      marginBottom: 6,
                    }}>
                      {cityInfo.tagline}
                    </h2>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                      {cityInfo.funFact}
                    </p>
                  </div>
                  <div style={{ fontSize: 40, flexShrink: 0, opacity: 0.9 }}>🗺️</div>
                </div>

                {/* Highlight chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                  {cityInfo.highlights.map((h) => (
                    <span key={h.label} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 99,
                      background: 'rgba(255,255,255,0.09)',
                      color: 'rgba(255,255,255,0.82)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(4px)',
                    }}>
                      {h.emoji} {h.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Deals */}
            {promotedStores.length > 0 && (
              <section className="mb-8 fade-up" style={{ animationDelay: '0.05s' }}>
                <div className="section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg,#e8401c,#f5a623)' }}>
                      🔥
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: '#1a1a2e', letterSpacing: '-0.01em' }}>Today's Deals</div>
                      <div className="section-label">Stores with active offers</div>
                    </div>
                  </div>
                  <span className="sponsored-chip">Sponsored ✦</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {promotedStores.map((store) => (
                    <StoreCard key={store.id} store={store} citySlug={citySlug} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Search results label */}
        {searchQuery && (
          <p style={{ fontSize: 13, fontWeight: 500, color: '#9898a8', marginBottom: 20 }}>
            {stores.length === 0 ? 'No stores found' : `${stores.length} result${stores.length > 1 ? 's' : ''}`}
            {' '}for "<strong style={{ color: '#1a1a2e' }}>{searchQuery}</strong>"
          </p>
        )}

        {/* Empty state */}
        {stores.length === 0 && (filterCategory || searchQuery) && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
            <p style={{ fontWeight: 700, fontSize: 17, color: '#1a1a2e' }}>No stores found</p>
            <Link href={`/${citySlug}`}>
              <button style={{
                marginTop: 20,
                fontSize: 13,
                fontWeight: 700,
                padding: '10px 24px',
                borderRadius: 99,
                background: '#e8401c',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}>
                Clear filters
              </button>
            </Link>
          </div>
        )}

        {/* Category sections — hidden on the default home view (deals only there) */}
        {!isDefaultView && displayCategories.map((catSlug, i) => {
          const catStores = grouped[catSlug];
          if (!catStores) return null;
          const cat = catStores[0].category;
          const grad = CAT_GRADIENT[catSlug] || 'linear-gradient(135deg,#667eea,#764ba2)';
          // On the city home, cap each category at 3 cards; "See all" only when more exist
          const PREVIEW_LIMIT = 3;
          const visibleStores = filterCategory ? catStores : catStores.slice(0, PREVIEW_LIMIT);
          const hasMore = !filterCategory && catStores.length > PREVIEW_LIMIT;
          return (
            <section key={catSlug} className="mb-8 fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              {!filterCategory && (
                <div className="section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="section-icon" style={{ background: grad }}>{cat.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: '#1a1a2e', letterSpacing: '-0.01em' }}>{cat.name}</div>
                      <div className="section-label">{catStores.length} stores</div>
                    </div>
                  </div>
                  {hasMore && (
                    <Link href={`/${citySlug}/${catSlug}`} className="see-all-pill">See all {catStores.length} →</Link>
                  )}
                </div>
              )}
              {filterCategory && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div className="section-icon" style={{ background: grad }}>{cat.emoji}</div>
                  <h1 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.02em' }}>
                    {cat.name} in {city.name}
                  </h1>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 99,
                    background: '#ffe8e5',
                    color: '#e8401c',
                  }}>
                    {catStores.length}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleStores.map((store) => (
                  <StoreCard key={store.id} store={store} citySlug={citySlug} />
                ))}
              </div>
            </section>
          );
        })}

        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: 13, color: '#b0b0be' }}>
            {allStores.length} stores in {city.name} ·{" "}
            <Link href="https://dashboard.localadda.com" style={{ fontWeight: 600, color: '#e8401c' }}>
              List yours free →
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
