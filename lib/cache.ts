/**
 * Universal Cache Implementation
 * Supports Upstash Redis with In-Memory Fallback
 */

import { Redis } from '@upstash/redis';

// In-Memory Cache Implementation (Fallback)
interface CacheEntry<T> {
    value: T;
    expiresAt: number;
    accessCount: number;
    lastAccessed: number;
}

export class InMemoryCache {
    private cache: Map<string, CacheEntry<any>>;
    private maxSize: number;
    private defaultTTL: number;

    constructor(maxSize: number = 1000, defaultTTL: number = 3600) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL; // seconds
    }

    set<T>(key: string, value: T, ttl?: number): void {
        const ttlSeconds = ttl ?? this.defaultTTL;
        const expiresAt = Date.now() + ttlSeconds * 1000;

        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.cache.set(key, {
            value,
            expiresAt,
            accessCount: 0,
            lastAccessed: Date.now(),
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        entry.accessCount++;
        entry.lastAccessed = Date.now();
        return entry.value as T;
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    private evictLRU(): void {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        this.cache.forEach((entry, key) => {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        });

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
}

// Unified Cache Interface
class AppCache {
    private redis: Redis | null = null;
    private memory: InMemoryCache;
    private useRedis: boolean = false;

    constructor() {
        this.memory = new InMemoryCache(
            parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
            parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10)
        );

        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            try {
                this.redis = new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN,
                });
                this.useRedis = true;
                console.log('✅ Initialized Upstash Redis Cache');
            } catch (error) {
                console.warn('⚠️ Failed to initialize Redis, falling back to memory cache', error);
                this.useRedis = false;
            }
        }
    }

    async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
        if (this.useRedis && this.redis) {
            try {
                await this.redis.set(key, value, { ex: ttl });
                return;
            } catch (error) {
                console.error('Redis set error:', error);
                // Fallback to memory
            }
        }
        this.memory.set(key, value, ttl);
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.useRedis && this.redis) {
            try {
                return await this.redis.get<T>(key);
            } catch (error) {
                console.error('Redis get error:', error);
                // Fallback to memory
            }
        }
        return this.memory.get<T>(key);
    }

    async delete(key: string): Promise<void> {
        if (this.useRedis && this.redis) {
            try {
                await this.redis.del(key);
                return;
            } catch (error) {
                console.error('Redis delete error:', error);
            }
        }
        this.memory.delete(key);
    }

    async getOrSet<T>(key: string, factory: () => Promise<T>, ttl: number = 3600): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const value = await factory();
        await this.set(key, value, ttl);
        return value;
    }
}

// Export singleton
export const cache = new AppCache();
export default cache;
