'use client';

import Link from "next/link";

interface Props {
  citySlug: string;
  cityName: string;
}

export function CityHomeButton({ citySlug, cityName }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 'max(80px, calc(68px + env(safe-area-inset-bottom)))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      pointerEvents: 'none',
    }}>
      <Link href={`/${citySlug}`} className="city-home-pill" style={{ pointerEvents: 'auto' }}>
        <span style={{ fontSize: 16 }}>🏠</span>
        <span>{cityName}</span>
        <span style={{ color: '#f5a623', fontSize: 11, fontWeight: 700 }}>· Offers & Places</span>
      </Link>
    </div>
  );
}
