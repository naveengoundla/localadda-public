'use client';

import { useEffect, useState } from "react";
import type { StoreItem } from "@/types";
import { getCustomer, sendCustomerOtp, verifyCustomerOtp, type CustomerProfile } from "@/lib/customerAuth";

export interface OrderingInfo {
  storeSlug: string;
  storeName: string;
  storePhone: string;
}

type Cart = Record<string, number>;
type Step = 'closed' | 'review' | 'phone' | 'otp' | 'details' | 'blocked';

const cartKey = (slug: string) => `la_cart_${slug}`;

export function useCart(storeSlug: string) {
  const [cart, setCart] = useState<Cart>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartKey(storeSlug));
      if (raw) setCart(JSON.parse(raw));
    } catch { /* fresh cart */ }
  }, [storeSlug]);

  const update = (itemId: string, delta: number) => {
    setCart((c) => {
      const next = { ...c, [itemId]: Math.max(0, (c[itemId] || 0) + delta) };
      if (next[itemId] === 0) delete next[itemId];
      localStorage.setItem(cartKey(storeSlug), JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    setCart({});
    localStorage.removeItem(cartKey(storeSlug));
  };

  return { cart, update, clear };
}

export function OrderBar({ items, ordering, cart, updateCart, clearCart }: {
  items: StoreItem[];
  ordering: OrderingInfo;
  cart: Cart;
  updateCart: (itemId: string, delta: number) => void;
  clearCart: () => void;
}) {
  const [step, setStep] = useState<Step>('closed');
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [orderType, setOrderType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [address, setAddress] = useState('');

  useEffect(() => { setCustomer(getCustomer()); }, []);

  const lines = items.filter((i) => cart[i.id] > 0).map((i) => ({ item: i, qty: cart[i.id] }));
  const total = lines.reduce((sum, l) => sum + l.item.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  if (count === 0 && step === 'closed') return null;

  const fmt = (n: number) => n.toLocaleString('en-IN');

  function proceedFromReview() {
    const c = getCustomer();
    setCustomer(c);
    setError('');
    if (!c) { setStep('phone'); return; }
    if (!c.orderingEnabled) { setStep('blocked'); return; }
    setName(c.name);
    setStep('details');
  }

  async function handleSendOtp() {
    setBusy(true); setError('');
    try {
      await sendCustomerOtp(phone);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp() {
    setBusy(true); setError('');
    try {
      const profile = await verifyCustomerOtp(phone, otp, name || undefined);
      setCustomer(profile);
      if (!profile.orderingEnabled) { setStep('blocked'); return; }
      setStep('details');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }

  function placeOrder() {
    const c = customer;
    const itemLines = lines.map((l) => `• ${l.qty}× ${l.item.name} — ₹${fmt(l.item.price * l.qty)}`).join('\n');
    const fulfil = orderType === 'DELIVERY'
      ? `🛵 *Delivery to:* ${address.trim()}`
      : `🏪 *Pickup* from store`;
    const msg = [
      `📋 *Preorder via LocalAdda* — ${ordering.storeName}`,
      `Hi, I'd like to preorder the following:`,
      '',
      itemLines,
      `*Total: ₹${fmt(total)}* (cash ${orderType === 'DELIVERY' ? 'on delivery' : 'on pickup'})`,
      '',
      fulfil,
      `👤 ${c?.name || 'Customer'} · ${c?.phone || ''}`,
    ].join('\n');

    const waPhone = ordering.storePhone.replace(/[^0-9]/g, '').replace(/^(?!91)/, '91');
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    clearCart();
    setStep('closed');
  }

  const sheetStyle: React.CSSProperties = {
    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 120,
    background: '#fff', borderRadius: '20px 20px 0 0',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
    padding: '20px 20px max(20px, env(safe-area-inset-bottom))',
    maxWidth: 560, margin: '0 auto',
    animation: 'fadeUp 0.2s ease both',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1.5px solid rgba(0,0,0,0.12)', fontSize: 15,
    outline: 'none', marginBottom: 10, fontFamily: 'inherit',
  };
  const primaryBtn: React.CSSProperties = {
    width: '100%', padding: '13px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg,#1db954,#17a44b)', color: '#fff',
    fontWeight: 800, fontSize: 15, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(29,185,84,0.35)',
  };
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6 };

  return (
    <>
      {/* ── Sticky cart bar ── */}
      {count > 0 && step === 'closed' && (
        <div style={{
          position: 'fixed', left: 16, right: 16, bottom: 'max(16px, env(safe-area-inset-bottom))',
          zIndex: 110, maxWidth: 560, margin: '0 auto',
        }}>
          <button onClick={() => setStep('review')} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer',
            borderRadius: 16, padding: '14px 18px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.35)', fontFamily: 'inherit',
          }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>📋 {count} item{count > 1 ? 's' : ''}</span>
            <span style={{ fontWeight: 900, fontSize: 15 }}>₹{fmt(total)} · Review preorder →</span>
          </button>
        </div>
      )}

      {/* ── Sheets ── */}
      {step !== 'closed' && (
        <>
          <div onClick={() => setStep('closed')}
            style={{ position: 'fixed', inset: 0, zIndex: 115, background: 'rgba(10,10,20,0.5)' }} />
          <div style={sheetStyle}>

            {step === 'review' && (
              <>
                <div style={{ fontWeight: 900, fontSize: 17, color: '#1a1a2e', marginBottom: 14 }}>Your preorder</div>
                <div style={{ maxHeight: '40vh', overflowY: 'auto', marginBottom: 14 }}>
                  {lines.map(({ item, qty }) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f3f3' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1a1a2e' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>₹{fmt(item.price)}{item.unit ? ` / ${item.unit}` : ''}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => updateCart(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', fontWeight: 800, cursor: 'pointer' }}>−</button>
                        <span style={{ fontWeight: 800, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => updateCart(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#1db954', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>+</button>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: '#e8401c', minWidth: 64, textAlign: 'right' }}>₹{fmt(item.price * qty)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontWeight: 900, fontSize: 16, color: '#1a1a2e' }}>
                  <span>Total</span><span>₹{fmt(total)}</span>
                </div>
                <button onClick={proceedFromReview} style={primaryBtn} disabled={count === 0}>
                  Continue →
                </button>
              </>
            )}

            {step === 'phone' && (
              <>
                <div style={{ fontWeight: 900, fontSize: 17, color: '#1a1a2e', marginBottom: 6 }}>Verify your number</div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>We send a one-time code so the store knows this preorder is from a real customer.</p>
                <div style={label}>Your name</div>
                <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                <div style={label}>Mobile number</div>
                <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" inputMode="numeric" maxLength={10} />
                {error && <p style={{ fontSize: 12.5, color: '#e8401c', marginBottom: 10 }}>{error}</p>}
                <button onClick={handleSendOtp} style={primaryBtn} disabled={busy || phone.replace(/\D/g, '').length !== 10}>
                  {busy ? 'Sending…' : 'Send OTP'}
                </button>
              </>
            )}

            {step === 'otp' && (
              <>
                <div style={{ fontWeight: 900, fontSize: 17, color: '#1a1a2e', marginBottom: 6 }}>Enter the code</div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>Sent to {phone}</p>
                <input style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', fontWeight: 800, fontSize: 20 }}
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="••••••" inputMode="numeric" maxLength={6} autoFocus />
                {error && <p style={{ fontSize: 12.5, color: '#e8401c', marginBottom: 10 }}>{error}</p>}
                <button onClick={handleVerifyOtp} style={primaryBtn} disabled={busy || otp.length < 4}>
                  {busy ? 'Verifying…' : 'Verify'}
                </button>
                <button onClick={() => { setStep('phone'); setOtp(''); }} style={{ width: '100%', marginTop: 10, padding: 10, background: 'none', border: 'none', color: '#888', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  ← Change number
                </button>
              </>
            )}

            {step === 'blocked' && (
              <>
                <div style={{ textAlign: 'center', padding: '12px 0 4px', fontSize: 44 }}>🔒</div>
                <div style={{ fontWeight: 900, fontSize: 17, color: '#1a1a2e', textAlign: 'center', marginBottom: 8 }}>Preorder is invite-only right now</div>
                <p style={{ fontSize: 13.5, color: '#888', textAlign: 'center', marginBottom: 16, lineHeight: 1.6 }}>
                  We're piloting preorders with a small group. Your number is verified — we'll enable it soon!
                </p>
                <button onClick={() => setStep('closed')} style={{ ...primaryBtn, background: '#1a1a2e', boxShadow: 'none' }}>OK</button>
              </>
            )}

            {step === 'details' && (
              <>
                <div style={{ fontWeight: 900, fontSize: 17, color: '#1a1a2e', marginBottom: 14 }}>Pickup or delivery?</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {(['PICKUP', 'DELIVERY'] as const).map((t) => (
                    <button key={t} onClick={() => setOrderType(t)} style={{
                      flex: 1, padding: '12px 0', borderRadius: 12, cursor: 'pointer',
                      border: orderType === t ? '2px solid #1db954' : '1.5px solid #e0e0e0',
                      background: orderType === t ? '#edfbf1' : '#fff',
                      fontWeight: 800, fontSize: 14, color: orderType === t ? '#17a44b' : '#888',
                    }}>
                      {t === 'PICKUP' ? '🏪 Pickup' : '🛵 Delivery'}
                    </button>
                  ))}
                </div>
                {orderType === 'DELIVERY' && (
                  <>
                    <div style={label}>Delivery address</div>
                    <textarea style={{ ...inputStyle, minHeight: 70, resize: 'none' }}
                      value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no, street, landmark…" />
                  </>
                )}
                <p style={{ fontSize: 12.5, color: '#888', margin: '4px 0 14px' }}>
                  💵 Pay cash {orderType === 'DELIVERY' ? 'on delivery' : 'at pickup'}. Your preorder opens in WhatsApp — hit send to confirm with the store.
                </p>
                <button onClick={placeOrder} style={primaryBtn}
                  disabled={orderType === 'DELIVERY' && address.trim().length < 8}>
                  Send preorder on WhatsApp →
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
