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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }} className="px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href={`/${citySlug}`} className="text-white/70 hover:text-white text-sm">← {store.city.name}</Link>
          <span className="text-white/30">/</span>
          <Link href={`/${citySlug}?category=${categorySlug}`} className="text-white/70 hover:text-white text-sm">
            {store.category.emoji} {store.category.name}
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        {/* Banner */}
        {store.bannerUrl ? (
          <div className="relative h-52 sm:h-72">
            <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl font-black text-white">{store.name}</h1>
              <p className="text-white/80 text-sm">{store.category.emoji} {store.category.name} · {store.city.name}</p>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-6 pb-2">
            <h1 className="text-2xl font-black text-gray-900">{store.name}</h1>
            <p className="text-gray-500 text-sm">{store.category.emoji} {store.category.name} · {store.city.name}</p>
          </div>
        )}

        <div className="px-4 py-6 space-y-5">
          {/* Active discount banner */}
          {activeDiscount && (
            <div className="rounded-2xl p-4 flex items-center justify-between gap-3" style={{ background: "linear-gradient(135deg, #e8401c, #f5a623)" }}>
              <div>
                <div className="text-white font-black text-base">🎉 {activeDiscount.title}</div>
                {activeDiscount.description && <div className="text-white/85 text-sm mt-0.5">{activeDiscount.description}</div>}
                {activeDiscount.validUntil && <div className="text-white/70 text-xs mt-1">Valid until {activeDiscount.validUntil}</div>}
              </div>
              {activeDiscount.valueLabel && (
                <span className="bg-white/25 text-white font-black text-sm px-3 py-1.5 rounded-full whitespace-nowrap">
                  {activeDiscount.valueLabel}
                </span>
              )}
            </div>
          )}

          {/* Contact card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="font-black text-gray-900 mb-3">Contact & Location</h2>
            <div className="space-y-2">
              {store.phone && (
                <a href={`tel:${store.phone}`} className="flex items-center gap-3 py-2">
                  <span className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-lg">📞</span>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Phone</div>
                    <div className="text-green-700 font-bold">{store.phone}</div>
                  </div>
                  <span className="ml-auto bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Call Now</span>
                </a>
              )}
              {store.address && (
                <a
                  href={mapsUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 py-2"
                  style={mapsUrl ? {} : { pointerEvents: 'none' }}
                >
                  <span className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-lg">📍</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Address</div>
                    <div className="text-gray-800 text-sm">{store.address}</div>
                  </div>
                  {mapsUrl && (
                    <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      🗺️ Directions
                    </span>
                  )}
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-gray-700 text-sm leading-relaxed">{store.description}</p>
            </div>
          )}

          {/* Products */}
          {allItems.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h2 className="font-black text-gray-900 mb-4">📦 Products & Prices</h2>
              <div className="space-y-1">
                {allItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    {item.imageUrl ? (
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-lg" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xl">
                        {store.category.emoji}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {item.name}
                        {item.isFeatured && <span className="ml-1 text-orange-500 text-xs">★</span>}
                      </div>
                      {item.unit && <div className="text-gray-400 text-xs">per {item.unit}</div>}
                    </div>
                    <div className="text-red-500 font-black text-base">₹{item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {store.galleryUrls && store.galleryUrls.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h2 className="font-black text-gray-900 mb-4">📸 Photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {store.galleryUrls.map((url, i) => (
                  <div key={i} className="relative h-24 rounded-xl overflow-hidden">
                    <Image src={url} alt={`${store.name} photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hours */}
          {store.hours && Object.keys(store.hours).length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h2 className="font-black text-gray-900 mb-4">🕐 Opening Hours</h2>
              <div className="space-y-1">
                {DAYS.map((day) => {
                  const hours = store.hours?.[day];
                  if (!hours) return null;
                  return (
                    <div key={day} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-600 font-medium">{day}</span>
                      <span className={hours === "Closed" ? "text-red-400 font-semibold" : "text-gray-900 font-semibold"}>{hours}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3">
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex-1 py-4 rounded-2xl text-center font-black text-white text-base"
                style={{ background: "linear-gradient(135deg, #27ae60, #2ecc71)", boxShadow: "0 4px 15px rgba(39,174,96,0.4)" }}
              >
                📞 Call Now
              </a>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 rounded-2xl text-center font-black text-white text-base"
                style={{ background: "linear-gradient(135deg, #2980b9, #3498db)", boxShadow: "0 4px 15px rgba(52,152,219,0.4)" }}
              >
                🗺️ Directions
              </a>
            )}
          </div>

          {/* Back link */}
          <div className="text-center pb-6">
            <Link href={`/${citySlug}`} className="text-gray-400 text-sm hover:text-gray-600">
              ← More stores in {store.city.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
