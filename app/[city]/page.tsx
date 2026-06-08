import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCities, getStoresByCity, groupByCategory } from "@/lib/api";
import type { Store } from "@/types";

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
    <div className="min-h-screen" style={{ background: "#f7f7f8" }}>

      {/* ── Top header ── */}
      <header style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 pt-5 pb-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-white tracking-tight">
            Local<span style={{ color: "#f5a623" }}>Adda</span>
          </Link>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
            <span className="text-white text-sm">📍</span>
            <span className="text-white font-semibold text-sm">{city.name}</span>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-3xl mx-auto px-4 pb-5">
          <form method="GET">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search stores, products in ${city.name}…`}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm font-medium outline-none shadow-lg"
                style={{ background: "rgba(255,255,255,0.97)" }}
              />
            </div>
          </form>
        </div>

        {/* Category chips — scrollable */}
        <div className="max-w-3xl mx-auto px-4 pb-4 flex gap-2.5 overflow-x-auto scrollbar-hide">
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
      <div className="max-w-3xl mx-auto px-4 py-5">

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
            <section key={catSlug} className="mb-8">
              {/* Section header */}
              {!filterCategory && (
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.emoji}</span>
                    <h2 className="font-black text-gray-900 text-base">{cat.name}</h2>
                    <span className="text-gray-400 text-sm font-medium">({catStores.length})</span>
                  </div>
                  <Link href={`/${citySlug}/${catSlug}`}
                    className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                    See all →
                  </Link>
                </div>
              )}

              {/* Cards */}
              <div className="flex flex-col gap-3">
                {catStores.map((store) => (
                  <StoreCard key={store.id} store={store} citySlug={citySlug} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-gray-400 text-xs">
            {allStores.length} stores listed in {city.name} ·{" "}
            <Link href="https://dashboard.localadda.com" className="text-red-400 font-semibold">
              List yours free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function StoreCard({ store, citySlug }: { store: Store; citySlug: string }) {
  const activeDiscount = store.discounts?.find((d) => d.isActive);
  const itemCount = store.items?.length ?? 0;

  return (
    <Link href={`/${citySlug}/${store.category.slug}/${store.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden flex"
        style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)" }}>

        {/* Left — square image / emoji */}
        <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32">
          {store.bannerUrl ? (
            <Image
              src={store.bannerUrl}
              alt={store.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl"
              style={{ background: "linear-gradient(135deg, #fff5f3, #fff0e0)" }}>
              {store.category.emoji}
            </div>
          )}
          {activeDiscount && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-center"
              style={{ fontSize: 10, fontWeight: 800, padding: "2px 0" }}>
              🎉 {activeDiscount.valueLabel || "OFFER"}
            </div>
          )}
        </div>

        {/* Right — info */}
        <div className="flex-1 px-3.5 py-3 flex flex-col justify-between min-w-0">
          <div>
            {/* Name + category badge */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-black text-gray-900 text-sm leading-tight">{store.name}</h3>
              <span className="flex-shrink-0 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                {store.category.emoji} {store.category.name}
              </span>
            </div>

            {/* Address */}
            {store.address && (
              <p className="text-gray-400 text-xs mt-1 truncate">
                📍 {store.address}
              </p>
            )}

            {/* Items count + discount */}
            <div className="flex items-center gap-2 mt-1.5">
              {itemCount > 0 && (
                <span className="text-xs text-gray-400">
                  {itemCount} product{itemCount > 1 ? "s" : ""}
                </span>
              )}
              {activeDiscount && (
                <>
                  {itemCount > 0 && <span className="text-gray-200">·</span>}
                  <span className="text-xs font-bold text-green-600">
                    {activeDiscount.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bottom — call CTA */}
          <div className="flex items-center justify-between mt-2.5">
            {store.phone ? (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl"
                style={{ boxShadow: "0 2px 8px rgba(39,174,96,0.35)" }}
              >
                📞 Call Now
              </a>
            ) : (
              <span />
            )}
            <span className="text-red-400 text-xs font-bold">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
