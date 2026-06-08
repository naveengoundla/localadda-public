import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCities, getStoresByCity, groupByCategory } from "@/lib/api";
import type { Store } from "@/types";

interface Props {
  params: Promise<{ city: string; category: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = await params;
  const stores = await getStoresByCity(citySlug);
  const grouped = groupByCategory(stores);
  const cat = grouped[categorySlug]?.[0]?.category;
  const cities = await getCities();
  const city = cities.find((c) => c.slug === citySlug);
  if (!cat || !city) return {};
  return {
    title: `${cat.emoji} ${cat.name} Stores in ${city.name} — LocalAdda`,
    description: `Browse ${grouped[categorySlug].length} ${cat.name.toLowerCase()} stores in ${city.name}.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { city: citySlug, category: categorySlug } = await params;
  const { q: searchQuery } = await searchParams;

  const [cities, allStores] = await Promise.all([
    getCities(),
    getStoresByCity(citySlug),
  ]);

  const city = cities.find((c) => c.slug === citySlug)
    ?? allStores[0]?.city
    ?? { slug: citySlug, name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1), state: '', id: '' };

  const grouped = groupByCategory(allStores);
  const categoryStores = grouped[categorySlug] ?? [];

  // If category doesn't exist at all, 404
  if (allStores.length > 0 && categoryStores.length === 0) notFound();

  const cat = categoryStores[0]?.category ?? { slug: categorySlug, name: categorySlug, emoji: '🏪' };

  // Search filter
  let stores = categoryStores;
  if (searchQuery) {
    stores = stores.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }} className="px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3 mb-4">
          <Link href="/" className="text-white/50 hover:text-white text-sm">LocalAdda</Link>
          <span className="text-white/30">/</span>
          <Link href={`/${citySlug}`} className="text-white/70 hover:text-white text-sm">{city.name}</Link>
          <span className="text-white/30">/</span>
          <span className="text-white text-sm font-semibold">{cat.emoji} {cat.name}</span>
        </div>

        {/* Search */}
        <div className="max-w-5xl mx-auto">
          <form method="GET">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search ${cat.name} stores in ${city.name}…`}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm font-medium outline-none shadow-sm"
              />
            </div>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-black text-gray-900">
            {cat.emoji} {cat.name} in {city.name}
          </h1>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
            {stores.length} stores
          </span>
        </div>

        {/* No results */}
        {stores.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">{cat.emoji}</div>
            <p className="font-semibold">No stores found</p>
            {searchQuery && <p className="text-sm mt-1">Try a different search term</p>}
            <Link href={`/${citySlug}`} className="mt-4 inline-block text-red-500 text-sm font-semibold">
              ← Back to all stores
            </Link>
          </div>
        )}

        {/* Store grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} citySlug={citySlug} />
          ))}
        </div>

        {/* Back link */}
        {stores.length > 0 && (
          <div className="mt-8 text-center">
            <Link href={`/${citySlug}`} className="text-gray-400 text-sm hover:text-gray-600">
              ← All categories in {city.name}
            </Link>
          </div>
        )}
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
        {/* Left image */}
        <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32">
          {store.bannerUrl ? (
            <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" />
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
        {/* Right info */}
        <div className="flex-1 px-3.5 py-3 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-black text-gray-900 text-sm leading-tight">{store.name}</h3>
            {store.address && (
              <p className="text-gray-400 text-xs mt-1 truncate">📍 {store.address}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {itemCount > 0 && (
                <span className="text-xs text-gray-400">{itemCount} product{itemCount > 1 ? "s" : ""}</span>
              )}
              {activeDiscount && (
                <span className="text-xs font-bold text-green-600">{activeDiscount.title}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            {store.phone ? (
              <a href={`tel:${store.phone}`}
                className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl"
                style={{ boxShadow: "0 2px 8px rgba(39,174,96,0.35)" }}>
                📞 Call Now
              </a>
            ) : <span />}
            <span className="text-red-400 text-xs font-bold">View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
