const CACHE_TTL = 3 * 60 * 1000; // 3 minutes in ms
const CACHE_PREFIX = "finboard_cache_";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function getCacheKey(url: string, params?: Record<string, string>): string {
  const paramString = params ? JSON.stringify(params) : "";
  return CACHE_PREFIX + btoa(url + paramString).slice(0, 50);
}

export function getFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;

    if (age > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage full or other error - silently fail
  }
}

export function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(key);
  } else {
    // Clear all cache entries
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }
}

// Wrapper for cached fetch
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { skipCache?: boolean }
): Promise<T | null> {
  const cacheKey = getCacheKey(url);

  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cached = getFromCache<T>(cacheKey);
    if (cached) return cached;
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) return null;

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

