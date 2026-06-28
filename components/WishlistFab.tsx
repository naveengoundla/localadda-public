'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWishlist } from '@/lib/wishlist';

/**
 * Global floating wishlist entry. Appears on any page once the wishlist has
 * items, except the wishlist page itself. Positioned bottom-LEFT so it never
 * clashes with the store page's bottom-right "♡ Wishlist" mode pill.
 */
export default function WishlistFab() {
  const pathname = usePathname();
  const { count } = useWishlist();

  if (count === 0 || pathname === '/wishlist') return null;

  return (
    <Link href="/wishlist" aria-label={`Wishlist, ${count} items`} style={{ textDecoration: 'none' }}>
      <div style={{
        position: 'fixed', left: 16, bottom: 'max(20px, env(safe-area-inset-bottom))', zIndex: 90,
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: '#1a1a2e', color: '#fff', borderRadius: 99, padding: '11px 16px',
        fontWeight: 800, fontSize: 14, boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
      }}>
        ♡ <span>{count}</span>
      </div>
    </Link>
  );
}
