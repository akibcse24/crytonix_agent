/**
 * Prisma Client Singleton
 * Optimized for Render hobby plan with connection pooling
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        // Connection pool configuration for Render hobby plan
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Graceful shutdown helper
 */
export async function disconnectPrisma() {
    await prisma.$disconnect();
}

// Auto-disconnect on process termination
if (typeof window === 'undefined') {
    process.on('beforeExit', async () => {
        await disconnectPrisma();
    });
}
