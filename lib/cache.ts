/**
 * In-Memory Cache Implementation
 * Replaces Redis for Render hobby plan optimization
 * Uses LRU (Least Recently Used) eviction strategy
 */

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

    /**
     * Set a value in cache with optional TTL
     */
    set<T>(key: string, value: T, ttl?: number): void {
        const ttlSeconds = ttl ?? this.defaultTTL;
        const expiresAt = Date.now() + ttlSeconds * 1000;

        // Evict oldest entry if cache is full
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

    /**
     * Get a value from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Update access metadata
        entry.accessCount++;
        entry.lastAccessed = Date.now();

        return entry.value as T;
    }

    /**
     * Delete a key from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all entries from cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Check if key exists (and is not expired)
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        let expired = 0;
        let valid = 0;

        this.cache.forEach((entry) => {
            if (now > entry.expiresAt) {
                expired++;
            } else {
                valid++;
            }
        });

        return {
            total: this.cache.size,
            valid,
            expired,
            maxSize: this.maxSize,
            utilizationPercent: (this.cache.size / this.maxSize) * 100,
        };
    }

    /**
     * Evict least recently used entry
     */
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

    /**
     * Clean up expired entries
     */
    cleanup(): number {
        const now = Date.now();
        let removed = 0;

        this.cache.forEach((entry, key) => {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                removed++;
            }
        });

        return removed;
    }

    /**
     * Get or set pattern - fetch from cache or compute
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
}

// Global cache instance
const globalForCache = globalThis as unknown as {
    cache: InMemoryCache | undefined;
};

export const cache =
    globalForCache.cache ??
    new InMemoryCache(
        parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
        parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10)
    );

if (process.env.NODE_ENV !== 'production') globalForCache.cache = cache;

// Auto-cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
    setInterval(
        () => {
            const removed = cache.cleanup();
            if (removed > 0 && process.env.NODE_ENV === 'development') {
                console.log(`[Cache] Cleaned up ${removed} expired entries`);
            }
        },
        5 * 60 * 1000
    );
}

export default cache;
