import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getStoresByCity, groupByCategory } from "@/lib/api";
import { CitySearch } from "@/components/CitySearch";
import { CityHomeButton } from "@/components/CityHomeButton";

interface Props {
  params: Promise<{ city: string; category: string }>;
}

// ISR: render once, edge-cache for 5 min. Search is client-side.
export const revalidate = 300;
export function generateStaticParams() { return []; }

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

export default async function CategoryPage({ params }: Props) {
  const { city: citySlug, category: categorySlug } = await params;

  const [cities, allStores] = await Promise.all([getCities(), getStoresByCity(citySlug)]);
  const city = cities.find((c) => c.slug === citySlug) ?? allStores[0]?.city
    ?? { slug: citySlug, name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1), state: '', id: '' };

  const grouped = groupByCategory(allStores);
  const categoryStores = grouped[categorySlug] ?? [];
  if (allStores.length > 0 && categoryStores.length === 0) notFound();

  const cat = categoryStores[0]?.category ?? { slug: categorySlug, name: categorySlug, emoji: '🏪' };

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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>{cat.emoji} {cat.name} in {city.name}</h1>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: '#ffe8e5', color: '#e8401c' }}>{categoryStores.length}</span>
        </div>

        <CitySearch
          stores={categoryStores}
          citySlug={citySlug}
          placeholder={`Search ${cat.name} in ${city.name}…`}
          showAllWhenEmpty
        />

      </div>

      <CityHomeButton citySlug={citySlug} cityName={city.name} />
    </div>
  );
}
