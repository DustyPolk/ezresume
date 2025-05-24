import { LocationOption } from './geonames';

// In-memory cache for API responses
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Popular cities to preload for instant results
export const POPULAR_CITIES: LocationOption[] = [
  // Major US Tech Hubs
  { value: 'San Francisco, CA', label: 'San Francisco, CA ⭐' },
  { value: 'New York, NY', label: 'New York, NY ⭐' },
  { value: 'Seattle, WA', label: 'Seattle, WA ⭐' },
  { value: 'Austin, TX', label: 'Austin, TX ⭐' },
  { value: 'San Jose, CA', label: 'San Jose, CA ⭐' },
  { value: 'Boston, MA', label: 'Boston, MA ⭐' },
  { value: 'Los Angeles, CA', label: 'Los Angeles, CA ⭐' },
  { value: 'Chicago, IL', label: 'Chicago, IL ⭐' },
  { value: 'Denver, CO', label: 'Denver, CO ⭐' },
  { value: 'Atlanta, GA', label: 'Atlanta, GA ⭐' },
  { value: 'Dallas, TX', label: 'Dallas, TX ⭐' },
  { value: 'Washington, DC', label: 'Washington, DC ⭐' },
  { value: 'Portland, OR', label: 'Portland, OR ⭐' },
  { value: 'Miami, FL', label: 'Miami, FL ⭐' },
  { value: 'Phoenix, AZ', label: 'Phoenix, AZ ⭐' },
  
  // Remote Options (always at top)
  { value: 'Remote', label: 'Remote 🌍' },
  { value: 'Remote, USA', label: 'Remote, USA 🇺🇸' },
  { value: 'Hybrid', label: 'Hybrid 🏢' },
];

// Check if data is in cache and still valid
export function getCachedData(key: string): any | null {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  memoryCache.delete(key);
  return null;
}

// Store data in cache
export function setCachedData(key: string, data: any): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

// Get data from localStorage with expiry
export function getLocalStorageCache(key: string): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { data, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// Set data in localStorage with expiry
export function setLocalStorageCache(key: string, data: any, ttlHours: number = 24): void {
  if (typeof window === 'undefined') return;
  
  try {
    const expiry = Date.now() + (ttlHours * 60 * 60 * 1000);
    localStorage.setItem(key, JSON.stringify({ data, expiry }));
  } catch (e) {
    // Handle quota exceeded or other errors
    console.warn('Failed to cache in localStorage:', e);
  }
}

// Preload popular cities on app start
export function preloadPopularCities(): void {
  const cacheKey = 'geonames_popular_cities';
  setLocalStorageCache(cacheKey, POPULAR_CITIES, 24 * 7); // Cache for 1 week
}

// Filter popular cities based on search
export function filterPopularCities(search: string): LocationOption[] {
  if (!search || search.length < 2) return [];
  
  const searchLower = search.toLowerCase();
  return POPULAR_CITIES.filter(city => 
    city.value.toLowerCase().includes(searchLower)
  );
}