'use client';

import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/types";
import { getMapsUrl } from "@/lib/maps";

export function StoreCard({ store, citySlug }: { store: Store; citySlug: string }) {
  const activeDiscount = store.discounts?.find((d) => d.isActive);
  const itemCount = store.items?.length ?? 0;
  const mapsUrl = getMapsUrl(store.mapsUrl, store.address, store.city?.name);

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex h-full"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)" }}>

      {/* Left — square image */}
      <Link href={`/${citySlug}/${store.category.slug}/${store.slug}`}
        className="relative flex-shrink-0 w-28 sm:w-32 self-stretch">
        {store.bannerUrl ? (
          <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl min-h-[7rem]"
            style={{ background: "linear-gradient(135deg, #fff5f3, #fff0e0)" }}>
            {store.category.emoji}
          </div>
        )}
        {activeDiscount && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-center"
            style={{ fontSize: 10, fontWeight: 800, padding: "2px 4px" }}>
            🎉 {activeDiscount.valueLabel || "OFFER"}
          </div>
        )}
      </Link>

      {/* Right — info */}
      <div className="flex-1 flex flex-col justify-between px-3.5 py-3 min-w-0">
        <Link href={`/${citySlug}/${store.category.slug}/${store.slug}`} className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-gray-900 text-sm leading-tight line-clamp-2">{store.name}</h3>
            <span className="flex-shrink-0 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {store.category.emoji}
            </span>
          </div>
          {store.address && (
            <p className="text-gray-400 text-xs mt-1 truncate">📍 {store.address}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {itemCount > 0 && (
              <span className="text-xs text-gray-400">{itemCount} product{itemCount > 1 ? "s" : ""}</span>
            )}
            {activeDiscount && (
              <>
                {itemCount > 0 && <span className="text-gray-200">·</span>}
                <span className="text-xs font-bold text-green-600 truncate max-w-[120px]">{activeDiscount.title}</span>
              </>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2 mt-2.5">
          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ boxShadow: "0 2px 8px rgba(39,174,96,0.3)" }}
            >
              📞 Call
            </a>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}
            >
              🗺️
            </a>
          )}
          <span className="ml-auto text-red-400 text-xs font-bold">View →</span>
        </div>
      </div>
    </div>
  );
}
