'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Client-side sticky-city fallback. The server proxy handles normal browser
 * visits, but in the installed PWA the service worker can serve "/" from cache
 * (bypassing the proxy), so we also redirect here from the la_city cookie.
 * Skipped when "?pick=1" is present (user explicitly wants the picker).
 */
export function CityRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get('pick') !== null) return;
    const m = document.cookie.match(/(?:^|;\s*)la_city=([^;]+)/);
    const city = m ? decodeURIComponent(m[1]) : '';
    if (city) router.replace(`/${city}`);
  }, [params, router]);

  return null;
}
