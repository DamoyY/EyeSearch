// 网络请求
import {
  CACHE_MAX_ENTRIES,
  CACHE_TTL_MS,
  GOOGLE_API_KEY,
  GOOGLE_CX,
} from "./config.js";
const CACHE_STORAGE_KEY = "searchCache:v1";
const memoryCache = new Map();
function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function buildCacheKey(query, startIndex) {
  const normalized = (query ?? "").trim();
  return `${normalized}::${startIndex ?? 1}`;
}
function nowMs() {
  return Date.now();
}
function isExpired(entry) {
  if (!CACHE_TTL_MS) return false;
  return entry.time + CACHE_TTL_MS < nowMs();
}
function loadCacheFromStorage() {
  try {
    const storage = getStorage();
    if (!storage) return;
    const raw = storage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return;
    for (const item of parsed.entries) {
      if (!item || typeof item.key !== "string" || !("data" in item)) {
        continue;
      }
      const entry = {
        data: item.data,
        time: typeof item.time === "number" ? item.time : 0,
        access: typeof item.access === "number" ? item.access : 0,
      };
      if (!isExpired(entry)) {
        memoryCache.set(item.key, entry);
      }
    }
  } catch {}
}
function persistCacheToStorage() {
  try {
    const storage = getStorage();
    if (!storage) return;
    const entries = Array.from(memoryCache.entries()).map(([key, value]) => ({
      key,
      data: value.data,
      time: value.time,
      access: value.access,
    }));
    storage.setItem(CACHE_STORAGE_KEY, JSON.stringify({ entries }));
  } catch {}
}
function pruneCache() {
  if (memoryCache.size <= CACHE_MAX_ENTRIES) return;
  const sorted = Array.from(memoryCache.entries()).sort(
    (a, b) => (a[1].access || a[1].time) - (b[1].access || b[1].time),
  );
  while (memoryCache.size > CACHE_MAX_ENTRIES) {
    const oldest = sorted.shift();
    if (!oldest) break;
    memoryCache.delete(oldest[0]);
  }
}
function getCachedData(cacheKey) {
  const entry = memoryCache.get(cacheKey);
  if (!entry) return null;
  if (isExpired(entry)) {
    memoryCache.delete(cacheKey);
    return null;
  }
  entry.access = nowMs();
  return entry.data;
}
function setCachedData(cacheKey, data) {
  const timestamp = nowMs();
  memoryCache.set(cacheKey, { data, time: timestamp, access: timestamp });
  pruneCache();
}
loadCacheFromStorage();
function buildFetchUrl(query, startIndex) {
  return `https://customsearch.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
    query,
  )}&start=${startIndex}`;
}
export async function fetchSearch(query, startIndex, requestId) {
  const cacheKey = buildCacheKey(query, startIndex);
  const cached = getCachedData(cacheKey);
  if (cached) {
    persistCacheToStorage();
    return { data: cached, requestId };
  }
  const url = buildFetchUrl(query, startIndex);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  setCachedData(cacheKey, data);
  persistCacheToStorage();
  return { data, requestId };
}
