import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";
import { getCities } from "@/lib/api";
import { CityRedirect } from "@/components/CityRedirect";
import { Waitlist } from "@/components/Waitlist";

// The entry point must reach the proxy on every request (so the sticky-city
// redirect can fire); a prerendered/CDN-cached "/" would bypass it.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cities = await getCities();

  // IP-based area from Cloudflare visitor-location headers (if enabled).
  const h = await headers();
  const detectedArea = h.get("cf-ipcity") || "";
  const detectedRegion = h.get("cf-region") || "";
  const lat = h.get("cf-iplatitude");
  const lon = h.get("cf-iplongitude");
  const served = !!detectedArea && cities.some(
    (c) => c.name.toLowerCase() === detectedArea.toLowerCase() || c.slug === detectedArea.toLowerCase());

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee' }}>
      <Suspense fallback={null}><CityRedirect /></Suspense>
      <header style={{ background: 'linear-gradient(160deg,#1a1a2e,#0f3460)' }}
        className="max-w-full px-6 py-5 flex items-center justify-between">
        <div className="text-2xl font-black" style={{ color: '#f5a623' }}>
          Local<span style={{ color: '#fff' }}>Adda</span>
        </div>
        <Link href="https://dashboard.localadda.com"
          className="text-sm font-bold px-4 py-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
          List your store →
        </Link>
      </header>

      <div className="text-center px-6 pt-12 pb-12">
        <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3" style={{ color: '#1a1a2e' }}>
          Find local stores<br />
          <span style={{ color: '#e8401c' }}>near you</span>
        </h1>
        <p className="text-lg max-w-md mx-auto" style={{ color: '#888896' }}>
          Grocery, clothing, hardware, mobile repair — discover the best shops in your city.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <p className="section-label text-center mb-6">Choose your city</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {cities.map((city) => (
            <Link key={city.slug} href={`/${city.slug}`}>
              <div className="premium-card text-center p-5 cursor-pointer">
                {city.imageUrl ? (
                  <div className="mb-2" style={{
                    width: 56, height: 56, margin: '0 auto 8px', borderRadius: 12,
                    backgroundImage: `url(${city.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  }} />
                ) : (
                  <div className="text-3xl mb-2">{city.emoji || '🏙️'}</div>
                )}
                <div className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{city.name}</div>
                <div className="text-xs mt-0.5" style={{ color: '#aaa' }}>{city.state}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* IP-based waitlist for unserved areas */}
        <div className="mt-8">
          <Waitlist detectedArea={detectedArea} detectedRegion={detectedRegion} lat={lat} lon={lon} served={served} />
        </div>
      </div>

      <footer className="px-6 py-6 text-center text-sm"
        style={{ borderTop: '1px solid rgba(0,0,0,0.07)', color: '#bbb' }}>
        © 2026 LocalAdda ·{" "}
        <Link href="https://dashboard.localadda.com" className="font-semibold" style={{ color: '#e8401c' }}>
          List your store free →
        </Link>
      </footer>
    </div>
  );
}
