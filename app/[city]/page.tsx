import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getStoresByCity, groupByCategory } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) return {};
  return {
    title: `Local Stores in ${city.name} — LocalAdda`,
    description: `Discover grocery, clothing, hardware and more local stores in ${city.name}, ${city.state}.`,
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city: citySlug } = await params;
  const { category: filterCategory, q: searchQuery } = await searchParams;

  const [cities, allStores] = await Promise.all([
    getCities(),
    getStoresByCity(citySlug),
  ]);

  const cityFromList = cities.find((c) => c.slug === citySlug);
  const cityFromStores = allStores[0]?.city;
  const city = cityFromList ?? cityFromStores ?? { slug: citySlug, name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1), state: '', id: '' };
  if (!cityFromList && !cityFromStores && allStores.length === 0) notFound();

  let stores = allStores;
  if (searchQuery) {
    stores = stores.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const grouped = groupByCategory(stores);
  const allGrouped = groupByCategory(allStores);
  const categories = Object.keys(grouped);
  const displayCategories = filterCategory
    ? categories.filter((c) => c === filterCategory)
    : categories;

  const uniqueCategories = Object.keys(allGrouped).map((slug) => ({
    slug,
    name: allGrouped[slug][0].category.name,
    emoji: allGrouped[slug][0].category.emoji,
    count: allGrouped[slug].length,
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b14' }}>

      {/* ── Header ── */}
      <header style={{ background: 'linear-gradient(180deg, #111223 0%, #0a0b14 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight" style={{ color: '#f5a623' }}>
            Local<span style={{ color: '#f0f0f5' }}>Adda</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 14 }}>📍</span>
              <span className="font-bold text-sm" style={{ color: '#f0f0f5' }}>{city.name}</span>
            </div>
            <Link href="/" className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Change →
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <form method="GET">
            <div className="relative" style={{ maxWidth: 520 }}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search stores in ${city.name}…`}
                className="search-input w-full text-sm font-medium"
                style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12 }}
              />
            </div>
          </form>
        </div>

        {/* Category icon row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-5 flex gap-5 overflow-x-auto scrollbar-hide">
          {/* All */}
          <Link href={`/${citySlug}${searchQuery ? `?q=${searchQuery}` : ''}`}
            className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className={`cat-icon ${!filterCategory ? 'active' : ''}`}
              style={{ background: !filterCategory ? 'linear-gradient(135deg,#f5a623,#e8401c)' : 'rgba(255,255,255,0.08)' }}>
              🏪
            </div>
            <span className="text-xs font-bold" style={{ color: !filterCategory ? '#f0f0f5' : 'rgba(255,255,255,0.4)' }}>All</span>
          </Link>

          {uniqueCategories.map((cat) => {
            const active = filterCategory === cat.slug;
            const grad = CAT_GRADIENT[cat.slug] || 'linear-gradient(135deg,#667eea,#764ba2)';
            return (
              <Link key={cat.slug}
                href={`/${citySlug}?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className={`cat-icon ${active ? 'active' : ''}`}
                  style={{ background: active ? grad : 'rgba(255,255,255,0.08)' }}>
                  {cat.emoji}
                </div>
                <span className="text-xs font-bold text-center" style={{ color: active ? '#f0f0f5' : 'rgba(255,255,255,0.4)', width: 60 }}>
                  {cat.name.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">

        {/* Result hint */}
        {(searchQuery || filterCategory) && (
          <p className="text-sm font-medium mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {stores.length === 0 ? "No stores found" : `${stores.length} store${stores.length > 1 ? "s" : ""}`}
            {searchQuery && <span> for "<span style={{ color: '#f5a623' }}>{searchQuery}</span>"</span>}
            {filterCategory && <span> in <span style={{ color: '#f5a623' }}>{uniqueCategories.find(c => c.slug === filterCategory)?.name}</span></span>}
          </p>
        )}

        {/* Empty state */}
        {stores.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <p className="font-bold text-lg" style={{ color: '#f0f0f5' }}>No stores found</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Try a different search or category</p>
            <Link href={`/${citySlug}`}>
              <button className="mt-5 text-sm font-bold px-5 py-2.5 rounded-full"
                style={{ background: '#e8401c', color: '#fff' }}>
                Clear filters
              </button>
            </Link>
          </div>
        )}

        {/* Category sections */}
        {displayCategories.map((catSlug) => {
          const catStores = grouped[catSlug];
          const cat = catStores[0].category;
          const grad = CAT_GRADIENT[catSlug] || 'linear-gradient(135deg,#667eea,#764ba2)';
          return (
            <section key={catSlug} className="mb-10">
              {!filterCategory && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Colored emoji bubble */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: grad }}>
                      {cat.emoji}
                    </div>
                    <div>
                      <h2 className="font-black text-base" style={{ color: '#f0f0f5' }}>{cat.name}</h2>
                      <span className="section-label">{catStores.length} stores</span>
                    </div>
                  </div>
                  <Link href={`/${citySlug}/${catSlug}`}>
                    <span className="text-xs font-black px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      See all →
                    </span>
                  </Link>
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

        {/* Footer */}
        <div className="text-center pt-6 pb-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {allStores.length} stores in {city.name} ·{" "}
            <Link href="https://dashboard.localadda.com"
              className="font-semibold" style={{ color: '#f5a623' }}>
              List yours free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
