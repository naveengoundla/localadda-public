import Link from "next/link";
import { getCities } from "@/lib/api";

const CITY_EMOJI: Record<string, string> = {
  mumbai: '🌊', pune: '🏙️', delhi: '🕌', bengaluru: '🌿',
  hyderabad: '🍖', chennai: '🌴', ahmedabad: '🏛️', jaipur: '🌸',
  vikarabad: '🌾',
};

export default async function HomePage() {
  const cities = await getCities();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b14' }}>
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="text-2xl font-black" style={{ color: '#f5a623' }}>
          Local<span style={{ color: '#f0f0f5' }}>Adda</span>
        </div>
        <Link href="https://dashboard.localadda.com"
          className="text-sm font-bold px-4 py-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
          List your store →
        </Link>
      </header>

      {/* Hero */}
      <div className="text-center px-6 pt-10 pb-14">
        <div className="inline-block mb-4 text-sm font-bold px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(245,166,35,0.12)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.25)' }}>
          🇮🇳 Made for India's local businesses
        </div>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4" style={{ color: '#f0f0f5' }}>
          Find local stores<br />
          <span style={{ color: '#f5a623' }}>near you</span>
        </h1>
        <p className="text-lg max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Grocery, clothing, hardware, mobile repair — discover the best shops in your city.
        </p>
      </div>

      {/* Cities */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {cities.length === 0 ? (
          <p className="text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No cities yet.</p>
        ) : (
          <>
            <p className="section-label text-center mb-6">Browse by city</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {cities.map((city) => (
                <Link key={city.slug} href={`/${city.slug}`}>
                  <div className="premium-card text-center p-5 cursor-pointer">
                    <div className="text-3xl mb-2">{CITY_EMOJI[city.slug] || '🏙️'}</div>
                    <div className="font-bold text-sm" style={{ color: '#f0f0f5' }}>{city.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{city.state}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
        <p>
          © 2026 LocalAdda ·{" "}
          <Link href="https://dashboard.localadda.com" className="font-semibold" style={{ color: '#f5a623' }}>
            List your store free →
          </Link>
        </p>
      </footer>
    </div>
  );
}
