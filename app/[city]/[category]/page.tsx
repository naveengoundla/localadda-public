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

  return (
    <Link href={`/${citySlug}/${store.category.slug}/${store.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
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
        <div className="p-4">
          <div className="font-bold text-gray-900 text-base mb-1">{store.name}</div>
          {store.address && (
            <div className="text-gray-500 text-xs mb-3 truncate">📍 {store.address}</div>
          )}
          <div className="flex items-center justify-between">
            {store.phone && (
              <a href={`tel:${store.phone}`} className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
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
