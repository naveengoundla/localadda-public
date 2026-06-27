import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getStoresByCity, getCityBanners, groupByCategory } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";
import { BannerCarousel } from "@/components/BannerCarousel";
import { RememberCity } from "@/components/RememberCity";
import { NearMe } from "@/components/NearMe";
import { CitySearch } from "@/components/CitySearch";
import type { Store } from "@/types";

interface Props {
  params: Promise<{ city: string }>;
}

// ISR: render once, edge-cache for 5 min. Search/filter are client-side so the
// route stays static (reading searchParams would force per-request rendering).
export const revalidate = 300;
// Generate pages on demand and cache them (empty list = none prebuilt at build).
export function generateStaticParams() { return []; }

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

  const allGrouped = groupByCategory(allStores);

  const promotedStores: Store[] = allStores
    .filter((s) => s.discounts?.some((d) => d.isActive))
    .slice(0, 6);

  const uniqueCategories = Object.keys(allGrouped).map((slug) => ({
    slug,
    name: allGrouped[slug][0].category.name,
    emoji: allGrouped[slug][0].category.emoji,
    count: allGrouped[slug].length,
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef' }}>
      <RememberCity slug={citySlug} />

      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black" style={{ color: '#f5a623', letterSpacing: '-0.02em' }}>
            Local<span style={{ color: '#fff' }}>Adda</span>
          </Link>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: 99,
            padding: '6px 14px',
          }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span className="font-bold text-sm text-white">{city.name}</span>
            <Link href="/?pick=1" className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.45)' }}>change</Link>
          </div>
        </div>

        {/* Category pill tabs — link to the dedicated category route */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <Link href={`/${citySlug}`} className="nav-pill flex-shrink-0" data-active="true">
            🏠 Home
          </Link>
          {uniqueCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${citySlug}/${cat.slug}`}
              className="nav-pill flex-shrink-0"
              data-active="false"
            >
              {cat.emoji} {cat.name.split(' ')[0]}
            </Link>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        {/* Client-side search (keeps this route static/edge-cacheable) */}
        <CitySearch stores={allStores} citySlug={citySlug} placeholder={`Search stores in ${city.name}…`} />

        {/* Admin-managed hero banners (rotating) */}
        <BannerCarousel banners={banners} />

        {/* Shops near me (shows once stores have coordinates) */}
        <NearMe stores={allStores} citySlug={citySlug} />

        {/* Today's Deals */}
        {promotedStores.length > 0 && (
          <section className="mb-8 fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="section-icon" style={{ background: 'linear-gradient(135deg,#e8401c,#f5a623)' }}>🔥</div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 15, color: '#1a1a2e', letterSpacing: '-0.01em' }}>Today's Deals</div>
                  <div className="section-label">Stores with active offers</div>
                </div>
              </div>
              <span className="sponsored-chip">Sponsored ✦</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {promotedStores.map((store) => (
                <StoreCard key={store.id} store={store} citySlug={citySlug} />
              ))}
            </div>
          </section>
        )}

        {/* Browse by category */}
        {uniqueCategories.length > 0 && (
          <section className="mb-8">
            <div className="section-label" style={{ marginBottom: 10 }}>Browse by category</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {uniqueCategories.map((cat) => (
                <Link key={cat.slug} href={`/${citySlug}/${cat.slug}`}>
                  <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                    <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#1a1a2e' }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{cat.count} {cat.count === 1 ? 'store' : 'stores'}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: 13, color: '#b0b0be' }}>
            {allStores.length} stores in {city.name} ·{" "}
            <Link href="https://dashboard.localadda.com" style={{ fontWeight: 600, color: '#e8401c' }}>
              List yours free →
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
