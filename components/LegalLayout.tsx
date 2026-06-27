import Link from "next/link";

/**
 * Shared wrapper for the static legal/policy pages. These pages are content-only
 * (no server dynamic APIs) so they render statically and edge-cache.
 */
export function LegalLayout({ title, updated, children }: {
  title: string; updated: string; children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f5f1" }}>
      <header style={{ background: "linear-gradient(160deg,#1a1a2e,#0f3460)" }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-black" style={{ color: "#f5a623" }}>
            Local<span style={{ color: "#fff" }}>Adda</span>
          </Link>
          <Link href="/" className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>← Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <div style={{ background: "#fff7e6", border: "1px solid #ffe0a3", color: "#8a5a00", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, marginBottom: 20, lineHeight: 1.6 }}>
          ⚠️ <strong>Draft template — not yet legally reviewed.</strong> Placeholders in [BRACKETS] must be filled in, and this must be reviewed by a qualified Indian lawyer before relying on it.
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1a1a2e", letterSpacing: "-0.02em" }}>{title}</h1>
        <p style={{ fontSize: 12.5, color: "#999", marginTop: 4, marginBottom: 24 }}>Last updated: {updated}</p>

        <div className="legal-prose">{children}</div>

        <style>{`
          .legal-prose { color:#33333b; font-size:14.5px; line-height:1.7; }
          .legal-prose h2 { font-size:17px; font-weight:800; color:#1a1a2e; margin:26px 0 8px; }
          .legal-prose h3 { font-size:14.5px; font-weight:800; color:#1a1a2e; margin:18px 0 6px; }
          .legal-prose p { margin:0 0 12px; }
          .legal-prose ul { margin:0 0 14px; padding-left:20px; }
          .legal-prose li { margin:0 0 6px; }
          .legal-prose strong { color:#1a1a2e; }
          .legal-prose a { color:#e8401c; font-weight:600; }
        `}</style>

        <p style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #e7e3da", fontSize: 12.5, color: "#aaa", display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ color: "#888" }}>Terms</Link>
          <Link href="/privacy" style={{ color: "#888" }}>Privacy</Link>
          <Link href="/seller-terms" style={{ color: "#888" }}>Seller Terms</Link>
          <Link href="/grievance" style={{ color: "#888" }}>Grievance</Link>
        </p>
      </main>
    </div>
  );
}
