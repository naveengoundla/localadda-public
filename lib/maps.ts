/**
 * Returns the best available maps URL for a store.
 * 1. Use store's own mapsUrl if set
 * 2. Fall back to Google Maps search using address + city name
 */
export function getMapsUrl(mapsUrl: string | null, address: string | null, cityName?: string): string | null {
  if (mapsUrl) return mapsUrl;
  if (address) {
    const query = encodeURIComponent(`${address}${cityName ? `, ${cityName}` : ''}`);
    return `https://maps.google.com/?q=${query}`;
  }
  return null;
}
