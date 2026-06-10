'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  citySlug?: string;
}

export function BottomNav({ citySlug }: Props) {
  const pathname = usePathname();

  const isHome = pathname === '/' || (!citySlug && pathname.split('/').length <= 2);
  const isCity = citySlug && pathname === `/${citySlug}`;
  const isSearch = pathname.includes('?') || false;

  return (
    <nav className="bottom-nav">
      <Link
        href="/"
        className={`bottom-nav-item ${isHome ? 'active' : ''}`}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Home</span>
      </Link>

      {citySlug ? (
        <Link
          href={`/${citySlug}`}
          className={`bottom-nav-item ${isCity ? 'active' : ''}`}
        >
          <span className="nav-icon">📍</span>
          <span className="nav-label">City</span>
        </Link>
      ) : (
        <Link href="/" className="bottom-nav-item">
          <span className="nav-icon">🔍</span>
          <span className="nav-label">Search</span>
        </Link>
      )}

      <Link
        href="https://dashboard.localadda.com"
        className="bottom-nav-item"
        target="_blank"
        rel="noreferrer"
      >
        <span className="nav-icon">🏪</span>
        <span className="nav-label">My Store</span>
      </Link>
    </nav>
  );
}
