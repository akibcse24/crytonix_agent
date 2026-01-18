import { NextResponse } from 'next/server';
import { logger } from '@/lib/monitoring/logger';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET() {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
            },
            environment: process.env.NODE_ENV || 'development',
            providers: {
                openai: !!process.env.OPENAI_API_KEY,
                anthropic: !!process.env.ANTHROPIC_API_KEY,
                groq: !!process.env.GROQ_API_KEY,
                google: !!process.env.GOOGLE_API_KEY,
                ollama: process.env.ENABLE_OLLAMA === 'true',
                openrouter: !!process.env.OPENROUTER_API_KEY,
            },
            features: {
                auth: !!process.env.NEXTAUTH_SECRET,
                rateLimit: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
                vectorSearch: process.env.ENABLE_VECTOR_SEARCH === 'true',
                caching: process.env.ENABLE_CACHE !== 'false',
            },
        };

        logger.debug('Health check', health);

        return NextResponse.json(health);
    } catch (error) {
        logger.error('Health check failed', { error });

        return NextResponse.json(
            {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
