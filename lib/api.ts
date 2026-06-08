import type { City, Store, Category } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "https://localadda-backend-production-a7e8.up.railway.app";

export async function getCities(): Promise<City[]> {
  const res = await fetch(`${API}/api/cities`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getStoresByCity(citySlug: string): Promise<Store[]> {
  const res = await fetch(`${API}/api/cities/${citySlug}/stores`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getStore(storeSlug: string): Promise<Store | null> {
  const res = await fetch(`${API}/api/store/${storeSlug}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API}/api/categories`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

// Group stores by category
export function groupByCategory(stores: Store[]): Record<string, Store[]> {
  return stores.reduce((acc, store) => {
    const key = store.category.slug;
    if (!acc[key]) acc[key] = [];
    acc[key].push(store);
    return acc;
  }, {} as Record<string, Store[]>);
}
