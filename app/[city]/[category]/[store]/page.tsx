import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getStore } from "@/lib/api";
import { getMapsUrl } from "@/lib/maps";
import { CityHomeButton } from "@/components/CityHomeButton";
import { BottomNav } from "@/components/BottomNav";

interface Props {
  params: Promise<{ city: string; category: string; store: string }>;
}

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

      {/* Banner */}
      <div className="relative w-full" style={{ height: 220 }}>
        {store.bannerUrl
          ? <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" sizes="100vw" />
          : <div className="w-full h-full" style={{ background: gradient }} />}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.15) 60%,transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{store.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {store.category.emoji} {store.category.name} · {store.city.name}
          </p>
        </div>
        {/* Category color bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: gradient }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 safe-bottom">
        <div className="lg:grid lg:grid-cols-3 lg:gap-7">

          {/* ── Left ── */}
          <div className="lg:col-span-2 space-y-4">

            {activeDiscount && (
              <div className="rounded-2xl p-4 flex items-center justify-between gap-3"
                style={{ background: 'linear-gradient(135deg,#e8401c,#f5a623)' }}>
                <div>
                  <div className="font-black text-base text-white">🎉 {activeDiscount.title}</div>
                  {activeDiscount.description && <div className="text-sm text-white/80 mt-0.5">{activeDiscount.description}</div>}
                </div>
                {activeDiscount.valueLabel && (
                  <span className="text-white font-black text-sm px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {activeDiscount.valueLabel}
                  </span>
                )}
              </div>
            )}

            {store.description && (
              <div style={card}>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{store.description}</p>
              </div>
            )}

            {allItems.length > 0 && (
              <div style={card}>
                <h2 className="font-black text-lg mb-4" style={{ color: '#1a1a2e' }}>📦 Products & Prices</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  {allItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2.5"
                      style={{ borderBottom: '1px solid #f5f5f5' }}>
                      {item.imageUrl
                        ? <div className="relative w-11 h-11 flex-shrink-0"><Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-xl" /></div>
                        : <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-xl" style={{ background: '#f4f2ee' }}>{store.category.emoji}</div>}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: '#1a1a2e' }}>
                          {item.name}{item.isFeatured && <span className="ml-1 text-xs" style={{ color: '#f5a623' }}>★</span>}
                        </div>
                        {item.unit && <div className="text-xs" style={{ color: '#aaa' }}>per {item.unit}</div>}
                      </div>
                      <div className="font-black text-base" style={{ color: '#e8401c' }}>₹{item.price}</div>
                    </div>
                  ))}
                </div>
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
      <BottomNav citySlug={citySlug} />
    </div>
  );
}
