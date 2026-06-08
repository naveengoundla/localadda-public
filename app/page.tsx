import Link from "next/link";
import { getCities } from "@/lib/api";

export default async function HomePage() {
  const cities = await getCities();

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)" }}>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="text-2xl font-black text-white">
          Local<span style={{ color: "#f5a623" }}>Adda</span>
        </div>
        <Link href="https://dashboard.localadda.com" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
          Store Owner? →
        </Link>
      </header>

      {/* Hero */}
      <div className="text-center px-6 pt-12 pb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          Discover local stores<br />
          <span style={{ color: "#f5a623" }}>in your city</span>
        </h1>
        <p className="text-white/70 text-lg max-w-md mx-auto">
          Grocery, clothing, hardware, mobile repair — find the best local shops near you.
        </p>
      </div>

      {/* Cities grid */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {cities.length === 0 ? (
          <p className="text-center text-white/50">No cities available yet.</p>
        ) : (
          <>
            <h2 className="text-white/60 text-sm font-bold uppercase tracking-widest mb-6 text-center">
              Browse by city
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cities.map((city) => (
                <Link key={city.slug} href={`/${city.slug}`}>
                  <div className="bg-white/10 hover:bg-white/20 transition-all rounded-2xl p-5 text-center cursor-pointer border border-white/10 hover:border-white/30">
                    <div className="text-3xl mb-2">🏙️</div>
                    <div className="text-white font-bold text-base">{city.name}</div>
                    <div className="text-white/50 text-xs mt-1">{city.state}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-white/40 text-sm">
        <p>© 2026 LocalAdda · <Link href="https://dashboard.localadda.com" className="hover:text-white/70">List your store free →</Link></p>
      </footer>
    </div>
  );
}
