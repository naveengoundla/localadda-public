'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Wishlist — a single, cross-store, browser-only shopping list with quantities.
 *
 * Design (decided product-side):
 *  - Opt-in: the user enters a "Wishlist" mode to add items; nothing is saved by default.
 *  - Works on EVERY store (unlike preorder, which is gated to ordering-enabled stores).
 *  - Holds QUANTITIES (not a save/unsave toggle), so it behaves like a persistent cart.
 *  - Browser storage only — no server, no cross-device. (Reminders are out of scope; they'd
 *    require a backend + push.)
 *  - Preorder is a CONTINUATION: for an ordering-enabled store, its slice of the wishlist
 *    feeds the existing review → unlock → WhatsApp flow. The cart is just this list filtered
 *    to one store.
 *
 * Each line snapshots enough to render & export offline without a refetch.
 */

export type WishlistLine = {
  storeId: string;
  storeSlug: string;
  storeName: string;
  citySlug: string;
  categorySlug: string;
  itemId: string;
  name: string;
  price: number;
  mrp?: number | null;
  unit?: string | null;
  imageUrl?: string | null;
  orderingEnabled: boolean; // snapshot so the wishlist page can gate the preorder CTA offline
  qty: number;
  addedAt: number;
};

/** Fields needed to create/identify a line (everything except qty/addedAt). */
export type WishlistItemRef = Omit<WishlistLine, 'qty' | 'addedAt'>;

const KEY = 'la_wishlist';
const CHANGED = 'la_wishlist_change'; // window event so all hook instances re-read after a write

const lineId = (storeId: string, itemId: string) => `${storeId}::${itemId}`;

function read(): WishlistLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.lines) ? (parsed.lines as WishlistLine[]) : [];
  } catch {
    return [];
  }
}

function write(lines: WishlistLine[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify({ lines }));
  window.dispatchEvent(new Event(CHANGED));
}

// ── mutations ──────────────────────────────────────────────────────────────

/** Set an absolute quantity for an item (upsert). qty <= 0 removes the line. */
export function setQty(ref: WishlistItemRef, qty: number): WishlistLine[] {
  const lines = read();
  const idx = lines.findIndex((l) => lineId(l.storeId, l.itemId) === lineId(ref.storeId, ref.itemId));
  if (qty <= 0) {
    if (idx >= 0) lines.splice(idx, 1);
  } else if (idx >= 0) {
    lines[idx] = { ...lines[idx], ...ref, qty };
  } else {
    lines.push({ ...ref, qty, addedAt: Date.now() });
  }
  write(lines);
  return lines;
}

/** Add `delta` to an item's quantity (creates the line if missing). */
export function changeQty(ref: WishlistItemRef, delta: number): WishlistLine[] {
  const current = read().find((l) => lineId(l.storeId, l.itemId) === lineId(ref.storeId, ref.itemId));
  return setQty(ref, (current?.qty ?? 0) + delta);
}

export function getQty(storeId: string, itemId: string): number {
  return read().find((l) => lineId(l.storeId, l.itemId) === lineId(storeId, itemId))?.qty ?? 0;
}

export function removeLine(storeId: string, itemId: string): WishlistLine[] {
  const lines = read().filter((l) => lineId(l.storeId, l.itemId) !== lineId(storeId, itemId));
  write(lines);
  return lines;
}

/** Remove all lines for one store (used after a successful preorder for that store). */
export function clearStore(storeId: string): WishlistLine[] {
  const lines = read().filter((l) => l.storeId !== storeId);
  write(lines);
  return lines;
}

export function clearAll(): void {
  write([]);
}

// ── selectors ──────────────────────────────────────────────────────────────

export function getAll(): WishlistLine[] {
  return read();
}

export function getStoreLines(storeId: string): WishlistLine[] {
  return read().filter((l) => l.storeId === storeId);
}

export type StoreGroup = {
  storeId: string;
  storeSlug: string;
  storeName: string;
  citySlug: string;
  categorySlug: string;
  orderingEnabled: boolean;
  lines: WishlistLine[];
  itemCount: number; // total quantity
  subtotal: number;
};

export function groupByStore(lines: WishlistLine[] = read()): StoreGroup[] {
  const map = new Map<string, StoreGroup>();
  for (const l of lines) {
    let g = map.get(l.storeId);
    if (!g) {
      g = {
        storeId: l.storeId, storeSlug: l.storeSlug, storeName: l.storeName,
        citySlug: l.citySlug, categorySlug: l.categorySlug, orderingEnabled: l.orderingEnabled,
        lines: [], itemCount: 0, subtotal: 0,
      };
      map.set(l.storeId, g);
    }
    g.lines.push(l);
    g.itemCount += l.qty;
    g.subtotal += l.qty * l.price;
  }
  return [...map.values()];
}

/** Total number of distinct lines (for the nav badge). Use itemCount sum if you prefer units. */
export function lineCount(lines: WishlistLine[] = read()): number {
  return lines.length;
}

export function totalQty(lines: WishlistLine[] = read()): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

// ── export ─────────────────────────────────────────────────────────────────

const storeUrl = (l: { citySlug: string; categorySlug: string; storeSlug: string }) =>
  `https://localadda.com/${l.citySlug}/${l.categorySlug}/${l.storeSlug}`;

/** Human/WhatsApp-friendly text, grouped by store, with quantities + a store link. */
export function exportText(lines: WishlistLine[] = read()): string {
  const groups = groupByStore(lines);
  const blocks = groups.map((g) => {
    const items = g.lines
      .map((l) => `  • ${l.qty}× ${l.name}${l.unit ? ` (${l.unit})` : ''} — ₹${l.qty * l.price}`)
      .join('\n');
    return `*${g.storeName}*\n${items}\n  ${storeUrl(g)}`;
  });
  return `🛍️ My LocalAdda wishlist\n\n${blocks.join('\n\n')}`;
}

/** CSV: store, item, qty, unit, price, line_total, link */
export function exportCsv(lines: WishlistLine[] = read()): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [['store', 'item', 'qty', 'unit', 'price', 'line_total', 'link']];
  for (const l of lines) {
    rows.push([l.storeName, l.name, String(l.qty), l.unit ?? '', String(l.price), String(l.qty * l.price), storeUrl(l)].map(esc) as string[]);
  }
  return rows.map((r) => r.join(',')).join('\n');
}

export const WISHLIST_CHANGED_EVENT = CHANGED;

// ── React hook ───────────────────────────────────────────────────────────────

/**
 * Reactive view of the wishlist. Re-reads on any local write (CHANGED event) and
 * on cross-tab changes (storage event). Returns lines + bound mutators.
 */
export function useWishlist() {
  const [lines, setLines] = useState<WishlistLine[]>([]);

  useEffect(() => {
    const sync = () => setLines(read());
    sync(); // hydrate after mount (avoids SSR/client mismatch)
    window.addEventListener(CHANGED, sync);
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) sync(); };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGED, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return {
    lines,
    groups: groupByStore(lines),
    count: lines.length,
    totalQty: totalQty(lines),
    qtyOf: useCallback((storeId: string, itemId: string) => lines.find((l) => l.storeId === storeId && l.itemId === itemId)?.qty ?? 0, [lines]),
    setQty: useCallback((ref: WishlistItemRef, qty: number) => setQty(ref, qty), []),
    changeQty: useCallback((ref: WishlistItemRef, delta: number) => changeQty(ref, delta), []),
    removeLine: useCallback((storeId: string, itemId: string) => removeLine(storeId, itemId), []),
    clearStore: useCallback((storeId: string) => clearStore(storeId), []),
    clearAll: useCallback(() => clearAll(), []),
  };
}

/** Identity needed to build wishlist lines from a store page. */
export type StoreRef = {
  id: string;
  slug: string;
  name: string;
  citySlug: string;
  categorySlug: string;
  orderingEnabled: boolean;
};

type MinItem = { id: string; name: string; price: number; mrp?: number | null; unit?: string | null; imageUrl?: string | null };

/**
 * Cart-compatible view of the wishlist scoped to ONE store. Returns the exact
 * `{ cart, update, clear }` shape OrderBar already consumes, but backed by the
 * unified `la_wishlist` (cart = this store's slice). `update(itemId, delta)`
 * builds the full line snapshot from `items`.
 */
export function useStoreWishlist(store: StoreRef, items: MinItem[]) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const sync = () => setVersion((v) => v + 1);
    sync();
    window.addEventListener(CHANGED, sync);
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) sync(); };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGED, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const cart = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of getStoreLines(store.id)) m[l.itemId] = l.qty;
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id, version]);

  const update = useCallback((itemId: string, delta: number) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return;
    changeQty({
      storeId: store.id, storeSlug: store.slug, storeName: store.name,
      citySlug: store.citySlug, categorySlug: store.categorySlug, orderingEnabled: store.orderingEnabled,
      itemId: it.id, name: it.name, price: it.price, mrp: it.mrp ?? null, unit: it.unit ?? null, imageUrl: it.imageUrl ?? null,
    }, delta);
  }, [items, store]);

  const clear = useCallback(() => clearStore(store.id), [store.id]);

  return { cart, update, clear };
}
