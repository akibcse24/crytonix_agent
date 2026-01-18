/**
 * Rate Limiting Middleware
 * Uses Upstash Redis for distributed rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Upstash Redis (only if configured)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Create rate limiter: 10 requests per 10 seconds
    ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: 'crytonix:ratelimit',
    });
} else {
    console.warn('⚠️  Upstash Redis not configured - rate limiting disabled');
}

/**
 * In-memory rate limiting fallback (for development)
 */
const memoryStore = new Map<string, { count: number; resetTime: number }>();

function inMemoryRateLimit(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = memoryStore.get(identifier);

    if (!record || now > record.resetTime) {
        memoryStore.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    return true;
}

/**
 * Rate limit middleware
 */
/**
 * Check rate limit for an identifier
 */
export async function checkRateLimit(identifier: string, limitCount: number = 10, windowString: string = '10 s'): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    if (ratelimit) {
        // Create a specific limiter for this check if passing loose params is needed, 
        // but for now reusing global or creating new one might be needed if window changes.
        // For simplicity, using the global one for now, or creating a new temporary one? 
        // Creating new Ratelimit instances is cheap-ish.

        const limiter = new Ratelimit({
            redis: redis!,
            limiter: Ratelimit.slidingWindow(limitCount, windowString as any),
            analytics: true,
            prefix: 'crytonix:ratelimit',
        });

        return await limiter.limit(identifier);
    } else {
        // Fallback
        const windowMs = windowString.endsWith('m') ? parseInt(windowString) * 60000 : 10000; // rough parsing
        const allowed = inMemoryRateLimit(identifier, limitCount, windowMs);
        return {
            success: allowed,
            limit: limitCount,
            remaining: allowed ? limitCount - 1 : 0,
            reset: Date.now() + windowMs
        };
    }
}

/**
 * Rate limit middleware
 */
export async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
    // Get identifier (IP address or user ID)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const identifier = `ip:${ip}`;

    const { success, limit, reset, remaining } = await checkRateLimit(identifier, 10, '10 s');

    if (!success) {
        return NextResponse.json(
            {
                error: 'Rate limit exceeded',
                limit,
                reset: new Date(reset).toISOString(),
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': new Date(reset).toISOString(),
                },
            }
        );
    }
    return null;
}

/**
 * Clear rate limit for testing
 */
export async function clearRateLimit(identifier: string): Promise<void> {
    if (redis) {
        await redis.del(`crytonix:ratelimit:${identifier}`);
    } else {
        memoryStore.delete(identifier);
    }
}
