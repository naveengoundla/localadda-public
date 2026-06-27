'use client';

import { useState } from 'react';
import { joinWaitlist } from '@/lib/api';

export function Waitlist({ detectedArea, detectedRegion, lat, lon, served }: {
  detectedArea: string; detectedRegion: string; lat: string | null; lon: string | null; served: boolean;
}) {
  const [open, setOpen] = useState(!served && !!detectedArea);
  const [area, setArea] = useState(detectedArea);
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) { setErr('Enter a phone number or email'); return; }
    setBusy(true); setErr('');
    try {
      await joinWaitlist({
        area: area.trim() || undefined,
        region: detectedRegion || undefined,
        contact: contact.trim(),
        latitude: lat ? parseFloat(lat) : null,
        longitude: lon ? parseFloat(lon) : null,
      });
      setDone(true);
    } catch (e: any) {
      setErr(e.message || 'Could not join');
    } finally { setBusy(false); }
  }

  const card: React.CSSProperties = {
    maxWidth: 480, margin: '8px auto 0', background: '#fff', border: '1px solid #ececec',
    borderRadius: 14, padding: 18, textAlign: 'center',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 14, marginTop: 8,
  };

  if (done) {
    return (
      <div style={card}>
        <div style={{ fontSize: 28 }}>🎉</div>
        <p style={{ fontWeight: 800, color: '#1a1a2e', marginTop: 6 }}>You’re on the list!</p>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          We’ll notify you when LocalAdda launches{area ? ` in ${area}` : ' near you'}.
        </p>
      </div>
    );
  }

  return (
    <div style={card}>
      <p style={{ fontWeight: 800, color: '#1a1a2e' }}>
        {detectedArea && !served ? `LocalAdda isn’t in ${detectedArea} yet` : 'Don’t see your city?'}
      </p>
      <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
        Tell us where you are — we’ll notify you the moment we launch there.
      </p>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          marginTop: 12, padding: '10px 22px', borderRadius: 99, border: 'none',
          background: '#e8401c', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          🔔 Notify me
        </button>
      ) : (
        <form onSubmit={submit} style={{ marginTop: 6 }}>
          <input style={input} value={area} onChange={e => setArea(e.target.value)} placeholder="Your city / area" />
          <input style={input} value={contact} onChange={e => setContact(e.target.value)} placeholder="Phone number or email" />
          {err && <p style={{ fontSize: 12.5, color: '#e8401c', marginTop: 6 }}>{err}</p>}
          <button type="submit" disabled={busy} style={{
            width: '100%', marginTop: 10, padding: '11px', borderRadius: 10, border: 'none',
            background: '#e8401c', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            {busy ? 'Submitting…' : '🔔 Notify me when you launch'}
          </button>
        </form>
      )}
    </div>
  );
}
