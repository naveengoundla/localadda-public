'use client';

import { useState } from 'react';
import type { Store } from '@/types';
import { StoreCard } from './StoreCard';

// Haversine distance in km
function distKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function fmt(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function NearMe({ stores, citySlug }: { stores: Store[]; citySlug: string }) {
  const [state, setState] = useState<'idle' | 'locating' | 'done' | 'error'>('idle');
  const [sorted, setSorted] = useState<{ store: Store; dist: number }[]>([]);
  const [err, setErr] = useState('');

  // Only meaningful once some stores have coordinates.
  const withCoords = stores.filter((s) => s.latitude != null && s.longitude != null);
  if (withCoords.length === 0) return null;

  function locate() {
    if (!navigator.geolocation) { setErr('Location not supported on this device'); setState('error'); return; }
    setState('locating'); setErr('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const list = withCoords
          .map((s) => ({ store: s, dist: distKm(pos.coords.latitude, pos.coords.longitude, s.latitude!, s.longitude!) }))
          .sort((a, b) => a.dist - b.dist);
        setSorted(list);
        setState('done');
      },
      (e) => { setErr(e.message || 'Could not get your location'); setState('error'); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="mb-6">
      {state !== 'done' && (
        <button
          onClick={locate}
          disabled={state === 'locating'}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e6e6e6',
            background: '#fff', fontWeight: 700, fontSize: 14, color: '#1a1a2e', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          📍 {state === 'locating' ? 'Finding shops near you…' : 'Show shops near me'}
        </button>
      )}
      {state === 'error' && <p style={{ fontSize: 12.5, color: '#e8401c', marginTop: 8 }}>{err}</p>}

      {state === 'done' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p className="section-label" style={{ margin: 0 }}>📍 Nearest to you</p>
            <button onClick={() => setState('idle')}
              style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>
              clear
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sorted.slice(0, 12).map(({ store, dist }) => (
              <div key={store.id} style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', top: 8, left: 8, zIndex: 2, fontSize: 11, fontWeight: 700,
                  color: '#fff', background: 'rgba(26,26,46,0.82)', borderRadius: 99, padding: '3px 8px',
                }}>📍 {fmt(dist)}</span>
                <StoreCard store={store} citySlug={citySlug} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
