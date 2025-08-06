// Cache manager with multiple strategies
import { ICache } from '../types/base';
import { MemoryCache } from './memory-cache';
import { logger } from '../logging/logger';
import { getConfig } from '../config';

export type CacheStrategy = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';

export interface CacheConfig {
  strategy: CacheStrategy;
  maxSize?: number;
  defaultTTL?: number;
  prefix?: string;
}

export class CacheManager {
  private static instance: CacheManager;
  private caches = new Map<string, ICache>();
  private defaultConfig: CacheConfig;

  private constructor() {
    const appConfig = getConfig();
    this.defaultConfig = {
      strategy: 'memory',
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      prefix: 'app_cache_'
    };
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  getCache(name: string = 'default', config?: Partial<CacheConfig>): ICache {
    if (this.caches.has(name)) {
      return this.caches.get(name)!;
    }

    const finalConfig = { ...this.defaultConfig, ...config };
    const cache = this.createCache(finalConfig);
    
    this.caches.set(name, cache);
    
    logger.info('Cache created', { name, strategy: finalConfig.strategy });
    
    return cache;
  }

  removeCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache && 'destroy' in cache && typeof cache.destroy === 'function') {
      (cache as any).destroy();
    }
    
    return this.caches.delete(name);
  }

  clearAllCaches(): void {
    for (const [name, cache] of this.caches.entries()) {
      cache.clear();
      if ('destroy' in cache && typeof cache.destroy === 'function') {
        (cache as any).destroy();
      }
    }
    
    this.caches.clear();
    logger.info('All caches cleared');
  }

  private createCache(config: CacheConfig): ICache {
    switch (config.strategy) {
      case 'memory':
        return new MemoryCache(config.maxSize, config.defaultTTL);
      
      case 'localStorage':
        return new LocalStorageCache(config.prefix, config.defaultTTL);
      
      case 'sessionStorage':
        return new SessionStorageCache(config.prefix, config.defaultTTL);
      
      default:
        logger.warn(`Unsupported cache strategy: ${config.strategy}, falling back to memory`);
        return new MemoryCache(config.maxSize, config.defaultTTL);
    }
  }
}

// LocalStorage cache implementation
class LocalStorageCache implements ICache {
  constructor(
    private prefix: string = 'cache_',
    private defaultTTL: number = 5 * 60 * 1000
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Check expiration
      if (Date.now() > parsed.expiresAt) {
        await this.delete(key);
        return null;
      }

      return parsed.value as T;
    } catch (error) {
      logger.warn('LocalStorage cache get error', error, { key });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const item = {
        value,
        expiresAt: Date.now() + (ttl || this.defaultTTL),
        createdAt: Date.now()
      };

      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      logger.warn('LocalStorage cache set error', error, { key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      logger.warn('LocalStorage cache delete error', error, { key });
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      );
      
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      logger.warn('LocalStorage cache clear error', error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return false;

      const parsed = JSON.parse(item);
      
      // Check expiration
      if (Date.now() > parsed.expiresAt) {
        await this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      logger.warn('LocalStorage cache has error', error, { key });
      return false;
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

// SessionStorage cache implementation
class SessionStorageCache implements ICache {
  constructor(
    private prefix: string = 'cache_',
    private defaultTTL: number = 5 * 60 * 1000
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = sessionStorage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Check expiration
      if (Date.now() > parsed.expiresAt) {
        await this.delete(key);
        return null;
      }

      return parsed.value as T;
    } catch (error) {
      logger.warn('SessionStorage cache get error', error, { key });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const item = {
        value,
        expiresAt: Date.now() + (ttl || this.defaultTTL),
        createdAt: Date.now()
      };

      sessionStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      logger.warn('SessionStorage cache set error', error, { key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      sessionStorage.removeItem(this.getKey(key));
    } catch (error) {
      logger.warn('SessionStorage cache delete error', error, { key });
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(sessionStorage).filter(key => 
        key.startsWith(this.prefix)
      );
      
      keys.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      logger.warn('SessionStorage cache clear error', error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const item = sessionStorage.getItem(this.getKey(key));
      if (!item) return false;

      const parsed = JSON.parse(item);
      
      // Check expiration
      if (Date.now() > parsed.expiresAt) {
        await this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      logger.warn('SessionStorage cache has error', error, { key });
      return false;
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Export convenience functions
export function getCache(name?: string, config?: Partial<CacheConfig>): ICache {
  return cacheManager.getCache(name, config);
}

export function createCache(name: string, config: Partial<CacheConfig>): ICache {
  return cacheManager.getCache(name, config);
}