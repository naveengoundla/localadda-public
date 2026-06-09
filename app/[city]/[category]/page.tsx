import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getStoresByCity, groupByCategory } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";

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
    title: `${cat.emoji} ${cat.name} in ${city.name} — LocalAdda`,
    description: `Browse ${grouped[categorySlug].length} ${cat.name.toLowerCase()} stores in ${city.name}.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { city: citySlug, category: categorySlug } = await params;
  const { q: searchQuery } = await searchParams;

  const [cities, allStores] = await Promise.all([getCities(), getStoresByCity(citySlug)]);

  const city = cities.find((c) => c.slug === citySlug)
    ?? allStores[0]?.city
    ?? { slug: citySlug, name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1), state: '', id: '' };

  const grouped = groupByCategory(allStores);
  const categoryStores = grouped[categorySlug] ?? [];
  if (allStores.length > 0 && categoryStores.length === 0) notFound();

  const cat = categoryStores[0]?.category ?? { slug: categorySlug, name: categorySlug, emoji: '🏪' };
  let stores = categoryStores;
  if (searchQuery) {
    stores = stores.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b14' }}>
      <header style={{ background: 'linear-gradient(180deg, #111223 0%, #0a0b14 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center gap-2 text-sm">
          <Link href="/" style={{ color: 'rgba(255,255,255,0.3)' }}>LocalAdda</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <Link href={`/${citySlug}`} style={{ color: 'rgba(255,255,255,0.5)' }}>{city.name}</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span className="font-bold" style={{ color: '#f0f0f5' }}>{cat.emoji} {cat.name}</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <form method="GET">
            <div className="relative" style={{ maxWidth: 520 }}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
              <input name="q" defaultValue={searchQuery}
                placeholder={`Search ${cat.name} in ${city.name}…`}
                className="search-input w-full text-sm font-medium"
                style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12 }}
              />
            </div>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-black" style={{ color: '#f0f0f5' }}>
            {cat.emoji} {cat.name} in {city.name}
          </h1>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(232,64,28,0.2)', color: '#f5a623' }}>
            {stores.length}
          </span>
        </div>

        {stores.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{cat.emoji}</div>
            <p className="font-semibold" style={{ color: '#f0f0f5' }}>No stores found</p>
            <Link href={`/${citySlug}`} className="mt-4 inline-block text-sm font-semibold" style={{ color: '#f5a623' }}>
              ← Back
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} citySlug={citySlug} />
          ))}
        </div>

        {stores.length > 0 && (
          <div className="mt-8 text-center">
            <Link href={`/${citySlug}`} className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
              ← All in {city.name}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
