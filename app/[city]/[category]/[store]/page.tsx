import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getStore } from "@/lib/api";
import { getMapsUrl } from "@/lib/maps";
import { CityHomeButton } from "@/components/CityHomeButton";
import { StoreImage } from "@/components/StoreImage";
import { ProductList } from "@/components/ProductList";
import { ExpandableText } from "@/components/ExpandableText";

interface Props {
  params: Promise<{ city: string; category: string; store: string }>;
}

// ISR: render once, cache at the edge for 5 min (repeat views served by CDN).
export const revalidate = 300;
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
  const { store: storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store) return {};
  return {
    title: `${store.name} — ${store.city.name} | LocalAdda`,
    description: store.description || `Visit ${store.name} in ${store.city.name}.`,
    openGraph: { title: store.name, images: store.bannerUrl ? [store.bannerUrl] : [] },
  };
}

export default async function StorePage({ params }: Props) {
  const { city: citySlug, category: categorySlug, store: storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store || store.status !== "ACTIVE") notFound();

  const activeDiscount = store.discounts?.find((d) => d.isActive);
  const allItems = [...(store.items?.filter(i => i.isFeatured) || []), ...(store.items?.filter(i => !i.isFeatured) || [])];
  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const mapsUrl = getMapsUrl(store.mapsUrl, store.address, store.city?.name);
  const gradient = CAT_GRADIENT[store.category.slug] || 'linear-gradient(135deg,#667eea,#764ba2)';

  const card = { background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)', padding: 20 };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee' }}>

      {/* Header */}
      <header style={{ background: 'linear-gradient(160deg,#1a1a2e,#0f3460)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm">
          <Link href={`/${citySlug}`} className="font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>← {store.city.name}</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <Link href={`/${citySlug}?category=${categorySlug}`} style={{ color: 'rgba(255,255,255,0.5)' }}>
            {store.category.emoji} {store.category.name}
          </Link>
        </div>
      </header>

      {/* Banner — store name, category, discount label & description overlaid */}
      <div style={{ position: 'relative', minHeight: 132, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
        <StoreImage
          src={store.bannerUrl}
          alt={store.name}
          emoji={store.category.emoji}
          gradient={gradient}
          sizes="100vw"
          emojiSize={40}
          quality={85}
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top,rgba(10,12,24,0.93) 0%,rgba(10,12,24,0.5) 46%,rgba(0,0,0,0.04) 100%)' }} />

        {/* Discount label */}
        {activeDiscount && (
          <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg,#e8401c,#f5a623)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 11px', borderRadius: 99, boxShadow: '0 3px 10px rgba(232,64,28,0.4)', maxWidth: '70%' }}>
            <span>🎉</span>
            <span className="truncate">{activeDiscount.valueLabel || activeDiscount.title}</span>
          </div>
        )}

        {/* Overlaid info */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6" style={{ position: 'relative', zIndex: 1, paddingTop: 14, paddingBottom: 12 }}>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{store.name}</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {store.category.emoji} {store.category.name} · {store.city.name}
          </p>
          {store.homeDelivery && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
              fontSize: 11, fontWeight: 700, color: '#fff',
              background: 'rgba(26,127,67,0.92)', borderRadius: 99, padding: '3px 10px',
            }}>
              🛵 Home Delivery
            </span>
          )}
          {store.description && (
            <div className="mt-1.5 max-w-2xl">
              <ExpandableText text={store.description} lines={1} size={11} color="rgba(255,255,255,0.82)" moreColor="#f5a623" />
            </div>
          )}
        </div>

        {/* Category color bottom line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: gradient, zIndex: 2 }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="lg:grid lg:grid-cols-3 lg:gap-7">

          {/* ── Left ── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Vegetables: fresh-rates banner */}
            {store.category.slug === 'vegetables' && allItems.length > 0 && (
              <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg,#56ab2f,#a8e063)' }}>
                <span style={{ fontSize: 18 }}>🥦</span>
                <span className="text-sm font-black text-white">Fresh rates — updated daily</span>
              </div>
            )}

            {allItems.length > 0 && (
              <div style={card}>
                <ProductList
                  items={allItems}
                  categoryEmoji={store.category.emoji}
                  schema={store.category.itemSchema}
                  categorySlug={store.category.slug}
                  layout={store.category.layout}
                  groupBy={store.category.groupBy}
                  ordering={store.orderingEnabled && store.phone ? {
                    storeSlug: store.slug,
                    storeName: store.name,
                    storePhone: store.phone,
                  } : null}
                />
              </div>
            )}

            {store.galleryUrls?.length > 0 && (
              <div style={card}>
                <h2 className="font-black text-lg mb-4" style={{ color: '#1a1a2e' }}>📸 Photos</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {store.galleryUrls.map((url, i) => (
                    <div key={i} className="relative h-24 rounded-xl overflow-hidden">
                      <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right ── */}
          <div className="mt-4 lg:mt-0 space-y-4">
            <div className="flex gap-3 lg:flex-col">
              {store.phone && (
                <a href={`tel:${store.phone}`} className="flex-1 py-4 rounded-2xl text-center font-black text-white text-base"
                  style={{ background: 'linear-gradient(135deg,#1db954,#17a44b)', boxShadow: '0 6px 20px rgba(29,185,84,0.35)' }}>
                  📞 Call Now
                </a>
              )}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer"
                  className="flex-1 py-4 rounded-2xl text-center font-black text-white text-base"
                  style={{ background: 'linear-gradient(135deg,#2980b9,#3498db)', boxShadow: '0 6px 20px rgba(52,152,219,0.35)' }}>
                  🗺️ Directions
                </a>
              )}
            </div>

            {/* Optical: book an eye test */}
            {store.category.slug === 'optical' && store.phone && (
              <a
                href={`https://wa.me/${store.phone.replace(/[^0-9]/g, '').replace(/^(?!91)/, '91')}?text=${encodeURIComponent(`Hi ${store.name}, I'd like to book an eye test.`)}`}
                target="_blank" rel="noreferrer"
                className="block py-4 rounded-2xl text-center font-black text-white text-base"
                style={{ background: 'linear-gradient(135deg,#36d1dc,#5b86e5)', boxShadow: '0 6px 20px rgba(91,134,229,0.35)' }}>
                📅 Book an eye test
              </a>
            )}

            <div style={card}>
              <h2 className="font-black mb-3" style={{ color: '#1a1a2e' }}>Contact & Location</h2>
              {store.phone && (
                <a href={`tel:${store.phone}`} className="flex items-center gap-3 py-2 rounded-xl hover:bg-gray-50 px-2 -mx-2">
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#edfbf1' }}>📞</span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: '#aaa' }}>Phone</div>
                    <div className="font-bold" style={{ color: '#1db954' }}>{store.phone}</div>
                  </div>
                </a>
              )}
              {store.address && (
                <a href={mapsUrl ?? undefined} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 py-2 rounded-xl hover:bg-gray-50 px-2 -mx-2"
                  style={{ pointerEvents: mapsUrl ? 'auto' : 'none' }}>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#eaf4fb' }}>📍</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: '#aaa' }}>Address</div>
                    <div className="text-sm" style={{ color: '#1a1a2e' }}>{store.address}</div>
                  </div>
                </a>
              )}
            </div>

            {store.hours && Object.keys(store.hours).length > 0 && (
              <div style={card}>
                <h2 className="font-black mb-4" style={{ color: '#1a1a2e' }}>🕐 Hours</h2>
                {DAYS.map((day) => {
                  const h = store.hours?.[day];
                  if (!h) return null;
                  return (
                    <div key={day} className="flex justify-between text-sm py-1.5" style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <span style={{ color: '#888' }}>{day}</span>
                      <span className="font-semibold" style={{ color: h === 'Closed' ? '#e8401c' : '#1a1a2e' }}>{h}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ height: 80 }} />
          </div>
        </div>
      </div>

      <CityHomeButton citySlug={citySlug} cityName={store.city.name} />
    </div>
  );
}
