import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getStoresByCity, groupByCategory } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";
import { CityHomeButton } from "@/components/CityHomeButton";

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
  return { title: `${cat.emoji} ${cat.name} in ${city.name} — LocalAdda` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { city: citySlug, category: categorySlug } = await params;
  const { q: searchQuery } = await searchParams;

  const [cities, allStores] = await Promise.all([getCities(), getStoresByCity(citySlug)]);
  const city = cities.find((c) => c.slug === citySlug) ?? allStores[0]?.city
    ?? { slug: citySlug, name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1), state: '', id: '' };

  const grouped = groupByCategory(allStores);
  const categoryStores = grouped[categorySlug] ?? [];
  if (allStores.length > 0 && categoryStores.length === 0) notFound();

  const cat = categoryStores[0]?.category ?? { slug: categorySlug, name: categorySlug, emoji: '🏪' };
  const stores = searchQuery
    ? categoryStores.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categoryStores;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee' }}>
      <header style={{ background: 'linear-gradient(160deg,#1a1a2e,#0f3460)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center gap-2 text-sm">
          <Link href="/" style={{ color: 'rgba(255,255,255,0.35)' }}>LocalAdda</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <Link href={`/${citySlug}`} style={{ color: 'rgba(255,255,255,0.55)' }}>{city.name}</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span className="font-bold text-white">{cat.emoji} {cat.name}</span>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <form method="GET">
            <div className="relative" style={{ maxWidth: 520 }}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }}>🔍</span>
              <input name="q" defaultValue={searchQuery}
                placeholder={`Search ${cat.name} in ${city.name}…`}
                className="search-input w-full text-sm font-medium"
                style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 11, paddingBottom: 11 }} />
            </div>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 safe-bottom">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>{cat.emoji} {cat.name} in {city.name}</h1>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: '#ffe8e5', color: '#e8401c' }}>{stores.length}</span>
        </div>

        {stores.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">{cat.emoji}</div>
            <p className="font-semibold text-gray-700">No stores found</p>
            <Link href={`/${citySlug}`} className="mt-3 inline-block text-sm font-semibold" style={{ color: '#e8401c' }}>← Back</Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stores.map((store) => <StoreCard key={store.id} store={store} citySlug={citySlug} />)}
        </div>

      </div>

      <CityHomeButton citySlug={citySlug} cityName={city.name} />
    </div>
  );
}
