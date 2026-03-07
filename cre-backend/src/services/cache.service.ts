import NodeCache from 'node-cache';
import { CacheEntry } from '../types/index.js';
import logger from '../utils/logger.js';

class CacheService {
  private cache: NodeCache;

  constructor(stdTTL: number = 900) {
    // Default 15 minutes
    this.cache = new NodeCache({ stdTTL, checkperiod: 120 });
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get<CacheEntry<T>>(key);
    if (!entry) {
      logger.debug(`Cache miss for key: ${key}`);
      return undefined;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    if (age > entry.ttl) {
      logger.debug(`Cache expired for key: ${key}`);
      this.cache.del(key);
      return undefined;
    }

    logger.debug(`Cache hit for key: ${key}, age: ${age}ms`);
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs || 15 * 60 * 1000; // Default 15 minutes
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    this.cache.set(key, entry);
    logger.debug(`Cache set for key: ${key}, ttl: ${ttl}ms`);
  }

  clear(key?: string): void {
    if (key) {
      this.cache.del(key);
      logger.debug(`Cache cleared for key: ${key}`);
    } else {
      this.cache.flushAll();
      logger.debug('Cache fully cleared');
    }
  }

  getStats() {
    return this.cache.getStats();
  }
}

export const cacheService = new CacheService();
