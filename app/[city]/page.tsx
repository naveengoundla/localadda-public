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

// City highlights — tagline, tourist spots, fun fact
// Future: move this to DB (cities.description / cities.highlights JSON column)
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

  // Promoted = stores with an active discount (future: paid promoted flag)
  const promotedStores: Store[] = allStores
    .filter((s) => s.discounts?.some((d) => d.isActive))
    .slice(0, 6);

  const uniqueCategories = Object.keys(allGrouped).map((slug) => ({
    slug,
    name: allGrouped[slug][0].category.name,
    emoji: allGrouped[slug][0].category.emoji,
    count: allGrouped[slug].length,
  }));

  // When filtering, show only that category; otherwise show all grouped by category
  const displayCategories = filterCategory
    ? Object.keys(grouped).filter((c) => c === filterCategory)
    : Object.keys(grouped);

  const isDefaultView = !filterCategory && !searchQuery;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee' }}>

      {/* ── Dark header ── */}
      <header style={{ background: 'linear-gradient(160deg,#1a1a2e 0%,#0f3460 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black" style={{ color: '#f5a623' }}>
            Local<span style={{ color: '#fff' }}>Adda</span>
          </Link>
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span>📍</span>
            <span className="font-bold text-sm text-white">{city.name}</span>
            <Link href="/" className="text-xs ml-1 hidden sm:block" style={{ color: 'rgba(255,255,255,0.5)' }}>change</Link>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <form method="GET">
            <div className="relative" style={{ maxWidth: 520 }}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>🔍</span>
              <input name="q" defaultValue={searchQuery}
                placeholder={`Search stores in ${city.name}…`}
                className="search-input w-full text-sm font-medium"
                style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 11, paddingBottom: 11 }} />
            </div>
          </form>
        </div>

        {/* Category circles — NO "All" tab */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-5 flex gap-5 overflow-x-auto scrollbar-hide">
          {uniqueCategories.map((cat) => {
            const active = filterCategory === cat.slug;
            return (
              <Link key={cat.slug}
                href={active ? `/${citySlug}` : `/${citySlug}?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className={`cat-icon ${active ? 'active' : ''}`}
                  style={{ background: active ? (CAT_GRADIENT[cat.slug] || 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.12)' }}>
                  {cat.emoji}
                </div>
                <span className="text-xs font-bold text-center"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.5)', width: 60 }}>
                  {cat.name.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Default view: city highlights + promoted ── */}
        {isDefaultView && (
          <>
            {/* City highlight card */}
            <div className="rounded-2xl overflow-hidden mb-6"
              style={{ background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f5a623' }}>
                      📍 {city.name}, {city.state}
                    </p>
                    <h2 className="text-lg font-black text-white leading-tight">{cityInfo.tagline}</h2>
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{cityInfo.funFact}</p>
                  </div>
                  <div className="text-4xl flex-shrink-0">🗺️</div>
                </div>

                {/* Highlight chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {cityInfo.highlights.map((h) => (
                    <span key={h.label}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {h.emoji} {h.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Promoted stores */}
            {promotedStores.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: 'linear-gradient(135deg,#e8401c,#f5a623)' }}>
                      🔥
                    </div>
                    <div>
                      <h2 className="font-black text-base" style={{ color: '#1a1a2e' }}>Today's Deals</h2>
                      <span className="section-label">Stores with active offers</span>
                    </div>
                  </div>
                  {/* Future: "Promote your store" CTA */}
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: '#fff3e8', color: '#e8401c', border: '1px solid #ffd6b8' }}>
                    Sponsored ✦
                  </span>
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
          <p className="text-sm font-medium mb-5" style={{ color: '#888896' }}>
            {stores.length === 0 ? 'No stores found' : `${stores.length} result${stores.length > 1 ? 's' : ''}`}
            {' '}for "<strong style={{ color: '#1a1a2e' }}>{searchQuery}</strong>"
          </p>
        )}

        {/* Empty */}
        {stores.length === 0 && (filterCategory || searchQuery) && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <p className="font-bold text-lg text-gray-800">No stores found</p>
            <Link href={`/${citySlug}`}>
              <button className="mt-5 text-sm font-bold px-5 py-2.5 rounded-full text-white"
                style={{ background: '#e8401c' }}>Clear filters</button>
            </Link>
          </div>
        )}

        {/* Category sections */}
        {displayCategories.map((catSlug) => {
          const catStores = grouped[catSlug];
          if (!catStores) return null;
          const cat = catStores[0].category;
          const grad = CAT_GRADIENT[catSlug] || 'linear-gradient(135deg,#667eea,#764ba2)';
          return (
            <section key={catSlug} className="mb-10">
              {!filterCategory && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: grad }}>
                      {cat.emoji}
                    </div>
                    <div>
                      <h2 className="font-black text-base" style={{ color: '#1a1a2e' }}>{cat.name}</h2>
                      <span className="section-label">{catStores.length} stores</span>
                    </div>
                  </div>
                  <Link href={`/${citySlug}/${catSlug}`}>
                    <span className="text-xs font-black px-3 py-1.5 rounded-full text-gray-500"
                      style={{ background: '#e8e6e2', border: '1px solid rgba(0,0,0,0.06)' }}>
                      See all →
                    </span>
                  </Link>
                </div>
              )}
              {filterCategory && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: grad }}>{cat.emoji}</div>
                  <h1 className="text-xl font-black" style={{ color: '#1a1a2e' }}>{cat.name} in {city.name}</h1>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: '#ffe8e5', color: '#e8401c' }}>{catStores.length}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catStores.map((store) => (
                  <StoreCard key={store.id} store={store} citySlug={citySlug} />
                ))}
              </div>
            </section>
          );
        })}

        <div className="text-center pt-6 pb-8" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-sm text-gray-400">
            {allStores.length} stores in {city.name} ·{" "}
            <Link href="https://dashboard.localadda.com" className="font-semibold" style={{ color: '#e8401c' }}>
              List yours free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
