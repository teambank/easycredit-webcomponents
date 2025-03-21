import { youngerThanOneDay  } from './utils';

interface CachedData<T> {
  timestamp: string;
  data: T;
}

export function getFromCache<T>(key: string): T | null {
  const cachedData = localStorage.getItem(key);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData) as CachedData<T>;
      if (youngerThanOneDay(parsed.timestamp)) {
        return parsed.data;
      }
      localStorage.removeItem(key);
    } catch (e) {
      localStorage.removeItem(key);
    }
  }
  return null;
}

export function setToCache<T>(key: string, data: T): void {
  localStorage.setItem(
    key,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      data: data,
    }),
  );
}
