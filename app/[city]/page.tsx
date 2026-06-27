import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCities, getStoresByCity, getCityBanners } from "@/lib/api";
import { CityBrowse } from "@/components/CityBrowse";

interface Props {
  params: Promise<{ city: string }>;
}

// ISR: render once, edge-cache for 5 min. Tabs/search are client-side (CityBrowse)
// so the route stays static — reading searchParams would force per-request render.
export const revalidate = 300;
export function generateStaticParams() { return []; }

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

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;

  const [cities, allStores, banners] = await Promise.all([
    getCities(),
    getStoresByCity(citySlug),
    getCityBanners(citySlug),
  ]);

  const cityFromList = cities.find((c) => c.slug === citySlug);
  const cityFromStores = allStores[0]?.city;
  const city = cityFromList ?? cityFromStores
    ?? { slug: citySlug, name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1), state: '', id: '' };
  if (!cityFromList && !cityFromStores && allStores.length === 0) notFound();

  return <CityBrowse city={city} banners={banners} stores={allStores} />;
}
