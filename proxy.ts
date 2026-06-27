import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Sticky city: if the visitor previously chose a city (la_city cookie), send
 * "/" straight to "/<city>" so they don't re-pick every visit. The picker is
 * always reachable via "/?pick=1" (the "change city" link), which skips this.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === '/' && !searchParams.has('pick')) {
    const city = request.cookies.get('la_city')?.value;
    if (city) {
      const url = request.nextUrl.clone();
      url.pathname = `/${city}`;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: '/' };
