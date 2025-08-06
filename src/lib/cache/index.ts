// Cache module exports

export * from './memory-cache';
export * from './cache-manager';

// Re-export commonly used items
export { MemoryCache } from './memory-cache';
export { CacheManager, cacheManager, getCache, createCache } from './cache-manager';
export type { CacheStrategy, CacheConfig } from './cache-manager';