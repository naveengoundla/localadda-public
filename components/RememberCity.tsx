'use client';

import { useEffect } from 'react';

/**
 * Persists the city the visitor is viewing so proxy.ts can auto-resume it on
 * their next visit to "/". 180-day cookie, readable server-side.
 */
export function RememberCity({ slug }: { slug: string }) {
  useEffect(() => {
    document.cookie = `la_city=${encodeURIComponent(slug)}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
  }, [slug]);
  return null;
}
