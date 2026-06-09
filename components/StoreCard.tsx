'use client';

import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/types";
import { getMapsUrl } from "@/lib/maps";

export function StoreCard({ store, citySlug }: { store: Store; citySlug: string }) {
  const activeDiscount = store.discounts?.find((d) => d.isActive);
  const itemCount = store.items?.length ?? 0;
  const mapsUrl = getMapsUrl(store.mapsUrl, store.address, store.city?.name);
  const href = `/${citySlug}/${store.category.slug}/${store.slug}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)" }}>

      <div className="flex">
        {/* Image — fixed 112×112, never stretches */}
        <Link href={href} className="relative flex-shrink-0" style={{ width: 112, height: 112 }}>
          {store.bannerUrl ? (
            <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl"
              style={{ background: "linear-gradient(135deg, #fff5f3, #fff0e0)" }}>
              {store.category.emoji}
            </div>
          )}
          {activeDiscount && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-center"
              style={{ fontSize: 9, fontWeight: 800, padding: "2px 4px", lineHeight: 1.4 }}>
              🎉 {activeDiscount.valueLabel || "OFFER"}
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between px-3 py-2.5 min-w-0">
          <Link href={href}>
            <div className="flex items-start justify-between gap-1.5">
              <h3 className="font-black text-gray-900 text-sm leading-snug line-clamp-2 flex-1">{store.name}</h3>
              <span className="flex-shrink-0 text-base leading-none mt-0.5">{store.category.emoji}</span>
            </div>
            {store.address && (
              <p className="text-gray-400 text-xs mt-1 truncate">📍 {store.address}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {itemCount > 0 && (
                <span className="text-xs text-gray-400">{itemCount} item{itemCount > 1 ? "s" : ""}</span>
              )}
              {activeDiscount && (
                <>
                  {itemCount > 0 && <span className="text-gray-200">·</span>}
                  <span className="text-xs font-bold text-green-600 truncate" style={{ maxWidth: 110 }}>
                    {activeDiscount.title}
                  </span>
                </>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2 mt-2">
            {store.phone && (
              <a href={`tel:${store.phone}`} onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl"
                style={{ boxShadow: "0 2px 6px rgba(39,174,96,0.3)" }}>
                📞 Call
              </a>
            )}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl"
                style={{ boxShadow: "0 2px 6px rgba(59,130,246,0.3)" }}>
                🗺️
              </a>
            )}
            <span className="ml-auto text-red-400 text-xs font-bold">View →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
