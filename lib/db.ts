/**
 * Prisma Client Singleton
 * Optimized for Render hobby plan with connection pooling
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 5 : 1, // Connection pooling optimized for Render
});
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: ['query', 'error', 'warn'],
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
