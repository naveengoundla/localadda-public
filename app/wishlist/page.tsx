'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist, exportText, exportCsv, type StoreGroup } from '@/lib/wishlist';

const storeHref = (g: { citySlug: string; categorySlug: string; storeSlug: string }) =>
  `/${g.citySlug}/${g.categorySlug}/${g.storeSlug}`;

export default function WishlistPage() {
  const { groups, count, setQty, changeQty } = useWishlist();

  async function share() {
    const text = exportText();
    try {
      if (navigator.share) { await navigator.share({ title: 'My LocalAdda wishlist', text }); return; }
    } catch { /* user cancelled share */ }
    try { await navigator.clipboard.writeText(text); alert('Wishlist copied to clipboard'); } catch { /* ignore */ }
  }

  function downloadCsv() {
    const blob = new Blob([exportCsv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'localadda-wishlist.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(160deg,#1a1a2e,#0f3460)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>♡ Wishlist</div>
        {count > 0 && <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{count} item{count > 1 ? 's' : ''}</div>}
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 40px' }}>
        {count === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: '#999' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>♡</div>
            <p style={{ fontWeight: 700, color: '#666', marginBottom: 6 }}>Your wishlist is empty</p>
            <p style={{ fontSize: 13.5, marginBottom: 18 }}>Browse stores and tap <b>♡ Wishlist → + ADD</b> to save items here.</p>
            <Link href="/" style={{ display: 'inline-block', background: '#e8401c', color: '#fff', fontWeight: 700, padding: '10px 18px', borderRadius: 99, textDecoration: 'none' }}>Find stores →</Link>
          </div>
        ) : (
          <>
            {/* Export */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={share} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#1a1a2e', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📤 Share / copy</button>
              <button onClick={downloadCsv} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #ddd', background: '#fff', color: '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>⬇ Export CSV</button>
            </div>

            {groups.map((g: StoreGroup) => (
              <div key={g.storeId} style={{ background: '#fff', borderRadius: 16, padding: 14, marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <Link href={storeHref(g)} style={{ textDecoration: 'none' }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: '#1a1a2e', marginBottom: 2 }}>{g.storeName} ›</div>
                </Link>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 10 }}>{g.itemCount} item{g.itemCount > 1 ? 's' : ''} · ₹{g.subtotal.toLocaleString('en-IN')}</div>

                {g.lines.map((l) => (
                  <div key={l.itemId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid #f3f3f3' }}>
                    {l.imageUrl
                      ? <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><Image src={l.imageUrl} alt={l.name} fill className="object-cover" sizes="40px" /></div>
                      : <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f4f2ee', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                      <div style={{ fontSize: 12, color: '#e8401c', fontWeight: 800 }}>₹{l.price}{l.unit ? ` / ${l.unit}` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => changeQty(l, -1)} aria-label="decrease" style={{ width: 26, height: 26, borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#fff', fontWeight: 800, cursor: 'pointer' }}>−</button>
                      <span style={{ fontWeight: 800, fontSize: 13, minWidth: 16, textAlign: 'center' }}>{l.qty}</span>
                      <button onClick={() => changeQty(l, 1)} aria-label="increase" style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: '#e8401c', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>+</button>
                    </div>
                    <button onClick={() => setQty(l, 0)} aria-label="remove" style={{ border: 'none', background: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                  </div>
                ))}

                {g.orderingEnabled ? (
                  <Link href={storeHref(g)} style={{ textDecoration: 'none' }}>
                    <div style={{ marginTop: 12, textAlign: 'center', background: 'linear-gradient(135deg,#1db954,#17a44b)', color: '#fff', fontWeight: 800, fontSize: 14, padding: '11px', borderRadius: 12 }}>
                      Continue to preorder →
                    </div>
                  </Link>
                ) : (
                  <Link href={storeHref(g)} style={{ textDecoration: 'none' }}>
                    <div style={{ marginTop: 12, textAlign: 'center', border: '1.5px solid #e0e0e0', color: '#555', fontWeight: 700, fontSize: 13.5, padding: '10px', borderRadius: 12 }}>
                      Visit store →
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
