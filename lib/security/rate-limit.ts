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
export async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
    // Get identifier (IP address or user ID)
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'anonymous';
    const identifier = `ip:${ip}`;

    if (ratelimit) {
        // Use Upstash Redis rate limiting
        const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

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

        // Add rate limit headers to response
        return null; // Proceed with request
    } else {
        // Fallback to in-memory rate limiting
        const allowed = inMemoryRateLimit(identifier, 10, 10000);

        if (!allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded (in-memory fallback)' },
                { status: 429 }
            );
        }

        return null;
    }
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
