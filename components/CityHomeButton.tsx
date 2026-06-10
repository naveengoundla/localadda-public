'use client';

import Link from "next/link";

interface Props {
  citySlug: string;
  cityName: string;
}

export function CityHomeButton({ citySlug, cityName }: Props) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '8px 16px 28px',
    }}>
      <Link href={`/${citySlug}`} className="city-home-pill">
        <span style={{ fontSize: 16 }}>🏠</span>
        <span>{cityName}</span>
        <span style={{ color: '#f5a623', fontSize: 11, fontWeight: 700 }}>· Offers & Places</span>
      </Link>
    </div>
  );
}
