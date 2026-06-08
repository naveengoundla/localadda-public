import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getStoresByCity, groupByCategory } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) return {};
  return {
    title: `Local Stores in ${city.name} — LocalAdda`,
    description: `Discover grocery, clothing, hardware and more local stores in ${city.name}, ${city.state}.`,
    openGraph: {
      title: `Local Stores in ${city.name}`,
      description: `Browse all local stores in ${city.name} on LocalAdda`,
    },
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
    <div className="min-h-screen" style={{ background: "#f4f5f7" }}>

      {/* ── Top header ── */}
      <header style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-white tracking-tight">
            Local<span style={{ color: "#f5a623" }}>Adda</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <span className="text-white text-sm">📍</span>
              <span className="text-white font-semibold text-sm">{city.name}</span>
            </div>
            <Link href="/" className="text-white/50 hover:text-white text-xs hidden sm:block">Change city</Link>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <form method="GET">
            <div className="relative max-w-xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search stores in ${city.name}…`}
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-gray-900 text-sm font-medium outline-none shadow-lg"
                style={{ background: "rgba(255,255,255,0.97)" }}
              />
            </div>
          </form>
        </div>

        {/* Category chips — scrollable */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <Link href={`/${citySlug}${searchQuery ? `?q=${searchQuery}` : ''}`}>
            <div className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${!filterCategory ? "bg-white text-red-500 border-white shadow-md" : "bg-white/15 text-white border-transparent"}`}>
              All
              <span className={`text-xs font-semibold ${!filterCategory ? "text-red-400" : "text-white/70"}`}>
                {allStores.length}
              </span>
            </div>
          </Link>
          {uniqueCategories.map((cat) => (
            <Link key={cat.slug} href={`/${citySlug}?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ''}`}>
              <div className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${filterCategory === cat.slug ? "bg-white text-red-500 border-white shadow-md" : "bg-white/15 text-white border-transparent"}`}>
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                <span className={`text-xs font-semibold ${filterCategory === cat.slug ? "text-red-400" : "text-white/70"}`}>
                  {cat.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Result count */}
        {(searchQuery || filterCategory) && (
          <p className="text-sm text-gray-500 font-medium mb-4">
            {stores.length === 0 ? "No stores found" : `${stores.length} store${stores.length > 1 ? "s" : ""} found`}
            {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
            {filterCategory && <span> in <strong>{uniqueCategories.find(c => c.slug === filterCategory)?.name}</strong></span>}
          </p>
        )}

        {/* No results */}
        {stores.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <p className="font-bold text-gray-700 text-lg">No stores found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
            <Link href={`/${citySlug}`} className="mt-5 inline-block bg-red-500 text-white text-sm font-bold px-5 py-2.5 rounded-full">
              Clear filters
            </Link>
          </div>
        )}

        {/* Stores by category */}
        {displayCategories.map((catSlug) => {
          const catStores = grouped[catSlug];
          const cat = catStores[0].category;
          return (
            <section key={catSlug} className="mb-10">
              {/* Section header */}
              {!filterCategory && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.emoji}</span>
                    <h2 className="font-black text-gray-900 text-lg">{cat.name}</h2>
                    <span className="text-gray-400 text-sm font-medium">({catStores.length})</span>
                  </div>
                  <Link href={`/${citySlug}/${catSlug}`}
                    className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors">
                    See all →
                  </Link>
                </div>
              )}

              {/* Cards — 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catStores.map((store) => (
                  <StoreCard key={store.id} store={store} citySlug={citySlug} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Footer */}
        <div className="text-center pt-4 pb-8 border-t border-gray-200 mt-4">
          <p className="text-gray-400 text-sm">
            {allStores.length} stores listed in {city.name} ·{" "}
            <Link href="https://dashboard.localadda.com" className="text-red-400 font-semibold hover:text-red-600">
              List yours free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
