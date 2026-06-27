export interface City {
  id: string;
  slug: string;
  name: string;
  state: string;
  emoji?: string | null;
  imageUrl?: string | null;
}

export interface CategoryField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'tags' | 'bool';
  options?: string[];
  filterable?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  emoji: string;
  itemSchema?: CategoryField[];
  layout?: 'list' | 'grid' | 'menu';
  groupBy?: string | null;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  mrp?: number | null;
  unit: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  attributes?: Record<string, unknown> | null;
}

export interface StoreDiscount {
  id: string;
  title: string;
  description: string | null;
  valueLabel: string | null;
  validUntil: string | null;
  isActive: boolean;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  status: string;
  category: Category;
  description: string | null;
  phone: string | null;
  address: string | null;
  mapsUrl: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bannerUrl: string | null;
  galleryUrls: string[];
  hours: Record<string, string> | null;
  isActive: boolean;
  orderingEnabled?: boolean;
  city: City;
  items: StoreItem[];
  discounts: StoreDiscount[];
}
