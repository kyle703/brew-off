// Tiny in-memory + localStorage cache for TSV responses and derived JSON

type CacheEntry<T> = { value: T; savedAt: number };

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string, maxAgeMs: number): T | null {
  const now = Date.now();
  // memory first
  const m = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (m && now - m.savedAt <= maxAgeMs) return m.value;
  // localStorage fallback
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (now - parsed.savedAt <= maxAgeMs) {
      memoryCache.set(key, parsed);
      return parsed.value;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setCached<T>(key: string, value: T): void {
  const entry: CacheEntry<T> = { value, savedAt: Date.now() };
  memoryCache.set(key, entry);
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore persistence failures (e.g., SSR or quota)
  }
}
