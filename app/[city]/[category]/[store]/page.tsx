import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getStore } from "@/lib/api";
import { getMapsUrl } from "@/lib/maps";

interface Props {
  params: Promise<{ city: string; category: string; store: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store: storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store) return {};
  return {
    title: `${store.name} — ${store.city.name} | LocalAdda`,
    description: store.description || `Visit ${store.name} in ${store.city.name}. ${store.items.length} products listed.`,
    openGraph: {
      title: store.name,
      description: store.description || `Local store in ${store.city.name}`,
      images: store.bannerUrl ? [store.bannerUrl] : [],
    },
  };
}

const SURFACE = '#12131f';
const SURFACE2 = '#1a1b2e';
const BORDER = '1px solid rgba(255,255,255,0.07)';
const MUTED = 'rgba(255,255,255,0.4)';

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

export default async function StorePage({ params }: Props) {
  const { city: citySlug, category: categorySlug, store: storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store || store.status !== "ACTIVE") notFound();

  const activeDiscount = store.discounts?.find((d) => d.isActive);
  const featuredItems = store.items?.filter((i) => i.isFeatured) || [];
  const otherItems = store.items?.filter((i) => !i.isFeatured) || [];
  const allItems = [...featuredItems, ...otherItems];
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mapsUrl = getMapsUrl(store.mapsUrl, store.address, store.city?.name);
  const gradient = CAT_GRADIENT[store.category.slug] || 'linear-gradient(135deg,#667eea,#764ba2)';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b14' }}>

      {/* Header */}
      <header style={{ background: 'linear-gradient(180deg,#111223,#0a0b14)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm">
          <Link href={`/${citySlug}`} style={{ color: 'rgba(255,255,255,0.4)' }}>← {store.city.name}</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <Link href={`/${citySlug}?category=${categorySlug}`} style={{ color: 'rgba(255,255,255,0.4)' }}>
            {store.category.emoji} {store.category.name}
          </Link>
        </div>
      </header>

      {/* Banner */}
      <div className="relative w-full" style={{ height: 220 }}>
        {store.bannerUrl ? (
          <>
            <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(10,11,20,0.95) 0%, rgba(10,11,20,0.4) 60%, transparent 100%)' }} />
          </>
        ) : (
          <div className="w-full h-full" style={{ background: gradient }} />
        )}
        {/* Colored bottom line from category */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: gradient }} />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 max-w-7xl mx-auto" style={{ left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight" style={{ color: '#f0f0f5' }}>
            {store.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            {store.category.emoji} {store.category.name} · {store.city.name}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">

          {/* ── Left (products, gallery, description) ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Discount banner */}
            {activeDiscount && (
              <div className="rounded-2xl p-4 flex items-center justify-between gap-3"
                style={{ background: 'linear-gradient(135deg,#e8401c,#f5a623)' }}>
                <div>
                  <div className="font-black text-base text-white">🎉 {activeDiscount.title}</div>
                  {activeDiscount.description && <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.85)' }}>{activeDiscount.description}</div>}
                  {activeDiscount.validUntil && <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Valid until {activeDiscount.validUntil}</div>}
                </div>
                {activeDiscount.valueLabel && (
                  <span className="font-black text-sm px-3 py-1.5 rounded-full whitespace-nowrap text-white"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {activeDiscount.valueLabel}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {store.description && (
              <div className="rounded-2xl p-5" style={{ background: SURFACE, border: BORDER }}>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{store.description}</p>
              </div>
            )}

            {/* Products */}
            {allItems.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: SURFACE, border: BORDER }}>
                <h2 className="font-black text-lg mb-4" style={{ color: '#f0f0f5' }}>📦 Products & Prices</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  {allItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {item.imageUrl ? (
                        <div className="relative w-11 h-11 flex-shrink-0">
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-xl" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
                          style={{ background: SURFACE2 }}>
                          {store.category.emoji}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: '#f0f0f5' }}>
                          {item.name}
                          {item.isFeatured && <span className="ml-1 text-xs" style={{ color: '#f5a623' }}>★</span>}
                        </div>
                        {item.unit && <div className="text-xs" style={{ color: MUTED }}>per {item.unit}</div>}
                      </div>
                      <div className="font-black text-base" style={{ color: '#f5a623' }}>₹{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {store.galleryUrls && store.galleryUrls.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: SURFACE, border: BORDER }}>
                <h2 className="font-black text-lg mb-4" style={{ color: '#f0f0f5' }}>📸 Photos</h2>
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

          {/* ── Right (CTA, contact, hours) ── */}
          <div className="mt-4 lg:mt-0 space-y-4">

            {/* CTA buttons */}
            <div className="flex gap-3 lg:flex-col">
              {store.phone && (
                <a href={`tel:${store.phone}`}
                  className="flex-1 py-4 rounded-2xl text-center font-black text-white text-base"
                  style={{ background: 'linear-gradient(135deg,#1db954,#17a44b)', boxShadow: '0 6px 24px rgba(29,185,84,0.4)' }}>
                  📞 Call Now
                </a>
              )}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer"
                  className="flex-1 py-4 rounded-2xl text-center font-black text-white text-base"
                  style={{ background: 'linear-gradient(135deg,#2980b9,#3498db)', boxShadow: '0 6px 24px rgba(52,152,219,0.4)' }}>
                  🗺️ Directions
                </a>
              )}
            </div>

            {/* Contact */}
            <div className="rounded-2xl p-5" style={{ background: SURFACE, border: BORDER }}>
              <h2 className="font-black mb-3" style={{ color: '#f0f0f5' }}>Contact & Location</h2>
              <div className="space-y-1">
                {store.phone && (
                  <a href={`tel:${store.phone}`}
                    className="flex items-center gap-3 py-2 rounded-xl px-2 -mx-2"
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: 'rgba(29,185,84,0.15)' }}>📞</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED }}>Phone</div>
                      <div className="font-bold" style={{ color: '#1db954' }}>{store.phone}</div>
                    </div>
                  </a>
                )}
                {store.address && (
                  <a href={mapsUrl ?? undefined} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 py-2 rounded-xl px-2 -mx-2"
                    style={{ transition: 'background 0.15s', pointerEvents: mapsUrl ? 'auto' : 'none' }}>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: 'rgba(52,152,219,0.15)' }}>📍</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED }}>Address</div>
                      <div className="text-sm" style={{ color: '#f0f0f5' }}>{store.address}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Hours */}
            {store.hours && Object.keys(store.hours).length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: SURFACE, border: BORDER }}>
                <h2 className="font-black mb-4" style={{ color: '#f0f0f5' }}>🕐 Opening Hours</h2>
                <div className="space-y-1">
                  {DAYS.map((day) => {
                    const hours = store.hours?.[day];
                    if (!hours) return null;
                    return (
                      <div key={day} className="flex justify-between text-sm py-1.5"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: MUTED }}>{day}</span>
                        <span className="font-semibold" style={{ color: hours === "Closed" ? '#e8401c' : '#f0f0f5' }}>
                          {hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-center pb-2">
              <Link href={`/${citySlug}`} className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                ← More stores in {store.city.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
