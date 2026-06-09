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
  const mapsUrl = getMapsUrl(store.mapsUrl, store.address, store.city?.name);
  const href = `/${citySlug}/${store.category.slug}/${store.slug}`;
  const gradient = CAT_GRADIENT[store.category.slug] || 'linear-gradient(135deg,#667eea,#764ba2)';

  return (
    <div className="premium-card" style={{ display: 'flex', alignItems: 'stretch' }}>

      {/* ── Left: image, fixed 110px wide ── */}
      <Link href={href} style={{ position: 'relative', width: 110, minHeight: 110, flexShrink: 0, display: 'block' }}>
        {store.bannerUrl ? (
          <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" sizes="110px" />
        ) : (
          <div style={{ width: '100%', height: '100%', minHeight: 110, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            {store.category.emoji}
          </div>
        )}
        {/* Discount badge — top-left corner of image only */}
        {activeDiscount?.valueLabel && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            background: '#e8401c', color: '#fff',
            fontSize: 9, fontWeight: 800,
            padding: '3px 7px',
            borderRadius: '0 0 8px 0',
            lineHeight: 1.4,
            zIndex: 1,
          }}>
            {activeDiscount.valueLabel}
          </div>
        )}
      </Link>

      {/* ── Right: info, grows to fill remaining width ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '10px 12px 10px 12px' }}>

        {/* Store name — always visible, never overflows */}
        <Link href={href} style={{ display: 'block', marginBottom: 4 }}>
          <div style={{ fontWeight: 900, fontSize: 13.5, color: '#1a1a2e', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {store.name}
          </div>
        </Link>

        {/* Address */}
        {store.address && (
          <div style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
            📍 {store.address}
          </div>
        )}

        {/* Discount pill */}
        {activeDiscount && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#edfbf1', color: '#1db954', padding: '2px 8px', borderRadius: 20 }}>
              🎉 {activeDiscount.title}
            </span>
          </div>
        )}

        {/* Spacer pushes buttons to bottom */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {store.phone && (
            <a href={`tel:${store.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="btn-glow-green"
              style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              📞 Call
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn-glow-blue"
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              ↗️
            </a>
          )}
          <Link href={href} style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: '#ccc', textDecoration: 'none' }}>
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
