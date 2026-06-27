'use client';

import Link from "next/link";
import type { Store } from "@/types";
import { getMapsUrl } from "@/lib/maps";
import { StoreImage } from "@/components/StoreImage";

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
    <div className="premium-card" style={{ display: 'flex', alignItems: 'stretch', minHeight: 100 }}>

      {/* ── Image strip ── */}
      <Link href={href} style={{
        position: 'relative',
        width: 108,
        minHeight: 108,
        flexShrink: 0,
        display: 'block',
      }}>
        <StoreImage
          src={store.bannerUrl}
          alt={store.name}
          emoji={store.category.emoji}
          gradient={gradient}
        />

        {/* Discount badge on image */}
        {activeDiscount?.valueLabel && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'linear-gradient(135deg,#e8401c,#f5a623)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            padding: '3px 7px',
            borderRadius: '0 0 8px 0',
            lineHeight: 1.4,
            zIndex: 1,
            letterSpacing: '0.02em',
          }}>
            {activeDiscount.valueLabel}
          </div>
        )}
      </Link>

      {/* ── Info panel ── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 12px 10px 12px',
      }}>
        {/* Name */}
        <Link href={href} style={{ display: 'block', marginBottom: 3 }}>
          <div style={{
            fontWeight: 800,
            fontSize: 13,
            color: '#1a1a2e',
            lineHeight: 1.35,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            letterSpacing: '-0.01em',
          }}>
            {store.name}
          </div>
        </Link>

        {/* Address */}
        {store.address && (
          <div style={{
            fontSize: 11,
            color: '#a0a0b0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: 5,
          }}>
            📍 {store.address}
          </div>
        )}

        {/* Home delivery pill */}
        {store.homeDelivery && (
          <div style={{ marginBottom: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10.5, fontWeight: 700, color: '#1a7f43',
              background: '#e7f6ec', borderRadius: 99, padding: '2px 8px',
            }}>
              🛵 Home Delivery
            </span>
          </div>
        )}

        {/* Discount pill */}
        {activeDiscount && (
          <div style={{ marginBottom: 6 }}>
            <span className="discount-badge">
              🎉 {activeDiscount.title}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="btn-glow-green"
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
              className="btn-glow-blue"
            >
              ↗️
            </a>
          )}
          <Link
            href={href}
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontWeight: 700,
              color: '#c0c0cc',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
