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

  // Build a city object from whatever we have — don't 404 just because getCities failed
  const cityFromList = cities.find((c) => c.slug === citySlug);
  const cityFromStores = allStores[0]?.city;
  const city = cityFromList ?? cityFromStores ?? { slug: citySlug, name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1), state: '', id: '' };
  if (!cityFromList && !cityFromStores && allStores.length === 0) notFound();

  // Filter by search
  let stores = allStores;
  if (searchQuery) {
    stores = stores.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Group by category
  const grouped = groupByCategory(stores);
  const categories = Object.keys(grouped);

  // Filter by category if selected
  const displayCategories = filterCategory
    ? categories.filter((c) => c === filterCategory)
    : categories;

  // Get unique categories for filter bar
  const uniqueCategories = categories.map((slug) => ({
    slug,
    name: grouped[slug][0].category.name,
    emoji: grouped[slug][0].category.emoji,
    count: grouped[slug].length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }} className="px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-white">
            Local<span style={{ color: "#f5a623" }}>Adda</span>
          </Link>
          <div className="text-white/70 text-sm">{city.name}, {city.state}</div>
        </div>

        {/* Search bar */}
        <div className="max-w-5xl mx-auto mt-4">
          <form method="GET">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search stores in ${city.name}…`}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm font-medium outline-none shadow-sm"
              />
            </div>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* City stats */}
        <div className="flex items-center gap-3 mb-5">
          <div className="text-2xl font-black text-gray-900">{city.name}</div>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
            {stores.length} stores
          </span>
        </div>

        {/* Category filter chips */}
        {uniqueCategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            <Link href={`/${citySlug}`}>
              <span className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${!filterCategory ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 border-gray-200"}`}>
                All ({stores.length})
              </span>
            </Link>
            {uniqueCategories.map((cat) => (
              <Link key={cat.slug} href={`/${citySlug}?category=${cat.slug}`}>
                <span className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${filterCategory === cat.slug ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 border-gray-200"}`}>
                  {cat.emoji} {cat.name} ({cat.count})
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* No results */}
        {stores.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">🏪</div>
            <p className="font-semibold">No stores found</p>
            {searchQuery && <p className="text-sm mt-1">Try a different search term</p>}
          </div>
        )}

        {/* Stores grouped by category */}
        {displayCategories.map((catSlug) => {
          const catStores = grouped[catSlug];
          const cat = catStores[0].category;
          return (
            <div key={catSlug} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900">
                  {cat.emoji} {cat.name}
                </h2>
                <Link href={`/${citySlug}/${catSlug}`} className="text-sm text-red-500 font-semibold">
                  See all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catStores.map((store) => (
                  <StoreCard key={store.id} store={store} citySlug={citySlug} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StoreCard({ store, citySlug }: { store: Store; citySlug: string }) {
  const activeDiscount = store.discounts?.find((d) => d.isActive);

  return (
    <Link href={`/${citySlug}/${store.category.slug}/${store.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
        {/* Banner */}
        {store.bannerUrl ? (
          <div className="relative h-36">
            <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" />
            {activeDiscount && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                🎉 {activeDiscount.valueLabel || "Offer"}
              </span>
            )}
          </div>
        ) : (
          <div className="h-36 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
            <span className="text-5xl">{store.category.emoji}</span>
          </div>
        )}

        {/* Info */}
        <div className="p-4">
          <div className="font-bold text-gray-900 text-base mb-1">{store.name}</div>
          {store.address && (
            <div className="text-gray-500 text-xs mb-3 truncate">📍 {store.address}</div>
          )}
          <div className="flex items-center justify-between">
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full"
              >
                📞 Call
              </a>
            )}
            {store.items && store.items.length > 0 && (
              <span className="text-gray-400 text-xs">{store.items.length} items</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
