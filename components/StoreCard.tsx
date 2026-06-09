'use client';

import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/types";
import { getMapsUrl } from "@/lib/maps";

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

export function StoreCard({ store, citySlug }: { store: Store; citySlug: string }) {
  const activeDiscount = store.discounts?.find((d) => d.isActive);
  const itemCount = store.items?.length ?? 0;
  const mapsUrl = getMapsUrl(store.mapsUrl, store.address, store.city?.name);
  const href = `/${citySlug}/${store.category.slug}/${store.slug}`;
  const gradient = CAT_GRADIENT[store.category.slug] || 'linear-gradient(135deg,#667eea,#764ba2)';

  return (
    <div className="premium-card flex">

      {/* Image — fixed 110×110 */}
      <Link href={href} className="relative flex-shrink-0" style={{ width: 110, height: 110 }}>
        {store.bannerUrl ? (
          <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" sizes="110px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl"
            style={{ background: gradient }}>
            {store.category.emoji}
          </div>
        )}
        {activeDiscount && (
          <div className="absolute top-0 left-0 text-white font-black"
            style={{ fontSize: 9, background: '#e8401c', padding: '3px 7px', borderRadius: '0 0 8px 0' }}>
            {activeDiscount.valueLabel || 'OFFER'}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between px-3 py-2.5 min-w-0">
        <Link href={href}>
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-black leading-snug line-clamp-2 flex-1"
              style={{ fontSize: 13.5, color: '#1a1a2e' }}>
              {store.name}
            </h3>
            {/* Category pill */}
            <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5"
              style={{ background: '#f4f2ee', color: '#888896' }}>
              {store.category.emoji}
            </span>
          </div>

          {store.address && (
            <p className="text-xs mt-1 truncate" style={{ color: '#aaa' }}>
              📍 {store.address}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {itemCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: '#f4f2ee', color: '#888896' }}>
                {itemCount} items
              </span>
            )}
            {activeDiscount && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#edfbf1', color: '#1db954' }}>
                🎉 {activeDiscount.title}
              </span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          {store.phone && (
            <a href={`tel:${store.phone}`} onClick={(e) => e.stopPropagation()}
              className="btn-glow-green flex items-center gap-1">
              📞 Call
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn-glow-blue flex items-center">
              🗺️
            </a>
          )}
          <Link href={href} className="ml-auto text-xs font-black" style={{ color: '#ccc' }}>
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
